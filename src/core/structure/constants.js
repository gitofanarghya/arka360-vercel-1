import { defaultGazeboModuleId, gazeboAllowedModules } from "../../constants";

export const DRAWING_CONSTANTS = {
    EDGES_COLOR: 0x000000,
    EDGES_LINE_WIDTH: 1,
    BUFFER: 0.005,
};
export const UPPER_LEGS= 0.7
       
export const LOWER_LEGS= 0.5

export const RAFTER_UP_SIDE= 1.17

export const RAFTER_DOWN_SIDE= -.13

export const ARKA_GAZEBO_FOOTING_LENGTH = 0.4;

export const ARKA_GAZEBO_FOOTING_WIDTH = 0.35;

export const ARKA_GAZEBO_FRONT_POST_TILT = 3;

export const ARKA_MODULE_MAKE = 'Arka';

export const VALIDATION_CHECKS = {
    PARENT_NON_ZERO_TILT: {
        name: 'parent-non-zero-tilt',
    },
    SUBARRAY_MOUNT_HEIGHT_HIGHER_THAN_COMPONENTS: {
        name: 'subarray-mount-height-higher-than-components',
    },
    MINIMUM_MOUNT_HEIGHT: {
        name: 'minimum-mount-height',
    },
    SUBARRAY_TILT: {
        name: 'subarray-tilt',
    },
    SUBARRAY_TILT_RANGE: {
        name: 'subarray-tilt-range',
    },
    LANDSCAPE_ONLY: {
        name: 'landscape-only',
    },
    PORTRAIT_ONLY: {
        name: 'portrait-only',
    },
    TABLE_SIZE: {
        name: 'table-size',
    },
    ROW_SPACING: {
        name: 'row-spacing',
        allowedVariation: 0,
    },
    TABLE_SPACING: {
        name: 'table-spacing',
        allowedVariation: 0,
    },
    MOUNT_HEIGHT: {
        name: 'mount-height',
        allowedVariation: 0,
    },
    MODULE77W_ID: {
        name: 'module-array',
    },
    MODULE_SPACING: {
        name: 'module-spacing',
    },
    CHECK_FIXED_MOUNT: {
        name: 'fixed-mount-check',
    },
    MULTI_PROPERTY_CHECKS: {
        name: 'multi-property-checks',
    },
    TABLE_SIZE_WIDE_MULTIPLE: {
        name: 'custom-function-table-size-wide',
    },
};

export const STYLES = {
    WOOD: {
        NAME: 'wood',
        URL: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/wood.jpg',
        COLOR: 0xb38554,
    },
    DARK_WOOD: {
        NAME: 'wood dark',
        URL: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/wood2.jpg',
        COLOR: 0x954019,
    },
    CEMENT: {
        NAME: 'cement',
        URL: 'https://res.cloudinary.com/dkb1nvu7q/image/upload/v1596054826/texture.jpg',
        COLOR: 0xcccecd,
    },
    STEEL: {
        NAME: 'steel',
        URL: 'https://design-studio-app.s3.ap-south-1.amazonaws.com/steel.jpg',
        COLOR: 0x888888,
    },
};

export const TEMPLATES = {
    DEFAULT_FIXED_TILT: {
        NAME: 'Default Fixed Tilt',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            Object.assign({}, VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT, { mountHeight: 0.350 }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        FOOTING: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                LENGTH: 0.35,
                WIDTH: 0.35,
                HEIGHT: 0.35,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.35,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.13,
                WIDTH: 0.06,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.35,
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.06,
                WIDTH: 0.12,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        PURLIN: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.06,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
    },
    PERGOLA: {
        NAME: 'Pergola',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            Object.assign({}, VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT, { mountHeight: 0.3 }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        LEG: {
            STYLE: STYLES.DARK_WOOD,
            SIZE: {
                LENGTH: 0.15,
                WIDTH: 0.15,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.35,
            },
        },
        RAFTER: {
            STYLE: STYLES.DARK_WOOD,
            SIZE: {
                HEIGHT: 0.06,
                WIDTH: 0.12,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        PURLIN: {
            STYLE: STYLES.DARK_WOOD,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.06,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
    },
    ARKAPERGOLA1: {
        NAME: 'PGUS01-01M1-77- 5x9',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            // Object.assign({}, VALIDATION_CHECKS.MODULE_ID, { moduleid: defaultGazeboModuleId }),
            Object.assign({}, VALIDATION_CHECKS.MODULE77W_ID, { moduleid: defaultGazeboModuleId, moduleIdArray: gazeboAllowedModules }),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 2.475 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [9], wideValues: [5] }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [11] }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 1 }),
            Object.assign({}, VALIDATION_CHECKS.MODULE_SPACING, { moduleSpacingUp: 0.001, moduleSpacingWide: 0.001 }),
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        NO_OF_LEGS: 2,
    },
    ARKAPERGOLA5X8: {
        NAME: 'PGUS01-01M1-77- 5x8',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            // Object.assign({}, VALIDATION_CHECKS.MODULE_ID, { moduleid: defaultGazeboModuleId }),
            Object.assign({}, VALIDATION_CHECKS.MODULE77W_ID, { moduleid: defaultGazeboModuleId, moduleIdArray: gazeboAllowedModules }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [8], wideValues: [5] }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [6.75] }),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 2.4 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 1 }),
            Object.assign({}, VALIDATION_CHECKS.MODULE_SPACING, { moduleSpacingUp: 0.001, moduleSpacingWide: 0.001 }),
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        NO_OF_LEGS: 2,
    },
    ARKAPERGOLA6X8: {
        NAME: 'PGUS01-01M1-77- 6x8',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            // Object.assign({}, VALIDATION_CHECKS.MODULE_ID, { moduleid: defaultGazeboModuleId }),
            Object.assign({}, VALIDATION_CHECKS.MODULE77W_ID, { moduleid: defaultGazeboModuleId, moduleIdArray: gazeboAllowedModules }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [8], wideValues: [6] }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [6.75] }),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 2.4 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 1 }),
            Object.assign({}, VALIDATION_CHECKS.MODULE_SPACING, { moduleSpacingUp: 0.001, moduleSpacingWide: 0.001 }),
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        NO_OF_LEGS: 2,
    },
    ARKAPERGOLA7X8: {
        NAME: 'PGUS01-01M1-77- 7x8',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            // Object.assign({}, VALIDATION_CHECKS.MODULE_ID, { moduleid: defaultGazeboModuleId }),
            Object.assign({}, VALIDATION_CHECKS.MODULE77W_ID, { moduleid: defaultGazeboModuleId, moduleIdArray: gazeboAllowedModules }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [8], wideValues: [7] }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [6.75] }),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 2.4 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 1 }),
            Object.assign({}, VALIDATION_CHECKS.MODULE_SPACING, { moduleSpacingUp: 0.001, moduleSpacingWide: 0.001 }),
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        NO_OF_LEGS: 4,
    },
    ARKAPERGOLA2: {
        NAME: 'PGUS01-01M1-77- 4x8',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            // Object.assign({}, VALIDATION_CHECKS.MODULE_ID, { moduleid: defaultGazeboModuleId }),
            Object.assign({}, VALIDATION_CHECKS.MODULE77W_ID, { moduleid: defaultGazeboModuleId, moduleIdArray: gazeboAllowedModules }),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 2.4 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [8], wideValues: [4] }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [6.75]}),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 1 }),
            Object.assign({}, VALIDATION_CHECKS.MODULE_SPACING, { moduleSpacingUp: 0.001, moduleSpacingWide: 0.001 }),
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        NO_OF_LEGS: 0,
    },
    LOW_FOUNDATION_FIXED_TILT: {
        NAME: 'Low Foundation Fixed Tilt',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            Object.assign({}, VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT, { mountHeight: 0.3 }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.13,
                WIDTH: 0.06,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.35,
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.06,
                WIDTH: 0.12,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        PURLIN: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.06,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
    },
    GENERAL_BALLAST: {
        NAME: 'General Ballast',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            VALIDATION_CHECKS.SUBARRAY_MOUNT_HEIGHT_HIGHER_THAN_COMPONENTS,
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [1] }),
            Object.assign(
                {}, VALIDATION_CHECKS.SUBARRAY_TILT_RANGE,
                { tilt: 10, allowedVariation: 5 },
            ),
            Object.assign({}, VALIDATION_CHECKS.ROW_SPACING, { rowSpacingValues: [0.8] }),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 0.15 }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
            Object.assign(
                {}, VALIDATION_CHECKS.MODULE_SPACING,
                { moduleSpacingUp: 0.025, moduleSpacingWide: 0.025 },
            ),
        ],
        BLOCK: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                LENGTH: 0.4064,
                WIDTH: 0.2032,
                HEIGHT: 0.1016,
            },
            BUFFER: {
                UP: 0,
                WIDE: 0,
            },
        },
        RAILING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.05,
                WIDTH: 0.1,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0,
                HORIZONTAL_END: 0.025,
            },
        },
        BACK_COVER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                THICKNESS: 0.01,
            },
        },
        CLIP: {
            STYLE: STYLES.STEEL,
            SIZE: {
                TOP_CUBOID: {
                    HEIGHT: 0.01,
                    WIDTH: 0.05,
                    LENGTH: 0.02,
                },
                SIDE_CUBOID: {
                    LENGTH: 0.01,
                    WIDTH: 0.05,
                    MINIMUM_HEIGHT: 0.01,
                },
            },
            BUFFER: {
                WIDE: 0,
                UP: 0,
                HORIZONTAL_END: 0,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.05,
                WIDTH: 0.01,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0,
                HORIZONTAL_END: 0.025,
            },
        },
    },
    UNIRAC_RM_5: {
        NAME: 'UNIRAC RM 5',
        // https://unirac.com/pdf/rm5-details/
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            VALIDATION_CHECKS.SUBARRAY_MOUNT_HEIGHT_HIGHER_THAN_COMPONENTS,
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [1] }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [5] }),
            Object.assign(
                {}, VALIDATION_CHECKS.ROW_SPACING,
                { rowSpacingValues: [0.18415, 0.2794] },
            ),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 0.10795 }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        BLOCK: {
            STYLE: Object.assign({
                MODEL_URL: 'https://sld-assets.s3.ap-south-1.amazonaws.com/blockStructure.stl',
            }, STYLES.STEEL),
            SIZE: {
                HEIGHT: 0,
            },
            BUFFER: {
                UP: 0,
                WIDE: 0,
            },
        },
        RAILING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.5,
                WIDTH: 0.1,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0,
                HORIZONTAL_END: 0.28,
            },
        },
    },
    UNIRAC_RM_10: {
        NAME: 'UNIRAC RM 10',
        // https://unirac.com/pdf/rm-details/
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            VALIDATION_CHECKS.SUBARRAY_MOUNT_HEIGHT_HIGHER_THAN_COMPONENTS,
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [1] }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [10] }),
            Object.assign(
                {}, VALIDATION_CHECKS.ROW_SPACING,
                { rowSpacingValues: [0.4826, 0.4572] },
            ),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 0.1524 }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        BLOCK: {
            STYLE: Object.assign({
                MODEL_URL: 'https://sld-assets.s3.ap-south-1.amazonaws.com/blockStructure.stl',
            }, STYLES.STEEL),
            SIZE: {
                HEIGHT: 0.05,
            },
            BUFFER: {
                UP: 0,
                WIDE: 0,
            },
        },
        RAILING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.5,
                WIDTH: 0.1,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0,
                HORIZONTAL_END: 0.32,
            },
        },
    },
    BALLAST_TYPE_1: {
        NAME: 'Ballast Type 1',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 0.03 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [1], wideValues: [1] }),
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 0.31 }),
            Object.assign({}, VALIDATION_CHECKS.MULTI_PROPERTY_CHECKS, {
                propertyChecks: [
                    { tilt: 15, pitch: 1.47 },
                    { tilt: 15, pitch: 1.65 },
                ],
                decidingFactor: 'tilt',
            }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        BLOCK: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                // TODO: Radius is being used to check stuff, is that okay?
                RADIUS: 0.15,
                HEIGHT: 0.3,
            },
            BUFFER: {
                UP: 0.45,
                WIDE: 0.4275,
            },
        },
        RAILING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.05,
                WIDTH: 0.1,
            },
            BUFFER: {
                WIDE: 0.3,
                UP: 0.4,
                HORIZONTAL_END: 0.4275,
            },
        },
        BACK_COVER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                THICKNESS: 0.01,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.01,
                WIDTH: 0.05,
            },
            // TODO: the WIDE and HORIZONTAL_END needs to be half of actually required.
            // this is because HORIZONTAL_END is actually WIDE + HORIZONTAL_END
            BUFFER: {
                WIDE: 0.3,
                UP: 0,
                HORIZONTAL_END: 0.4275,
                VERTICAL_END: 0.465,
                MIN_Z: 0.3,
                BACK_LEG_VERTICAL_END: 'ROW_SPACING',
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.01,
                WIDTH: 0.05,
            },
            BUFFER: {
                TOP: 0,
                BOTTOM: 0,
            },
        },
    },
    BALLAST_TYPE_2: {
        NAME: 'Ballast Type 2',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 0.03 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [1], wideValues: [1] }),
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 0.36 }),
            Object.assign({}, VALIDATION_CHECKS.MULTI_PROPERTY_CHECKS, {
                propertyChecks: [
                    { tilt: 10, pitch: 1.45 },
                    { tilt: 15, pitch: 1.5 },
                    { tilt: 20, pitch: 1.65 },
                ],
                decidingFactor: 'tilt',
            }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        BLOCK: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                // TODO: Radius is being used to check stuff, is that okay?
                RADIUS: 0.15,
                HEIGHT: 0.3,
            },
            BUFFER: {
                UP: 0,
                WIDE: 0.25,
            },
        },
        RAILING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.05,
                WIDTH: 0.078,
            },
            BUFFER: {
                WIDE: 0.3,
                UP: 0.4,
                HORIZONTAL_END: 0.4275,
                BOTTOM_UP: 0.3,
            },
        },
        BACK_COVER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                THICKNESS: 0.01,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.01,
                WIDTH: 0.07,
            },
            // TODO: the WIDE and HORIZONTAL_END needs to be half of actually required.
            //  this is because HORIZONTAL_END is actually WIDE + HORIZONTAL_END
            BUFFER: {
                WIDE: 0.3,
                UP: 0,
                HORIZONTAL_END: 0.4275,
                VERTICAL_END: 'ROW_SPACING',
                BOTTOM_UP: 0.35, // Block height (0.3) + half of railing height ( 0.5 )
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.01,
                WIDTH: 0.07,
            },
            BUFFER: {
                TOP: 0, // up and wide
                BOTTOM: 0,
            },
        },
    },
    BALLAST_TYPE_3: {
        NAME: 'Ballast Type 3',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 0.03 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [1], wideValues: [1] }),
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 0.11 }),
            Object.assign({}, VALIDATION_CHECKS.MULTI_PROPERTY_CHECKS, {
                propertyChecks: [
                    { tilt: 10, pitch: 1.45 },
                    { tilt: 15, pitch: 1.5 },
                    { tilt: 20, pitch: 1.65 },
                ],
                decidingFactor: 'tilt',
            }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        BLOCK: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                LENGTH: 0.35,
                WIDTH: 0.3,
                HEIGHT: 0.2,
            },
            BUFFER: {
                UP: 0,
                WIDE: 0.25,
                VERTICAL_END: 0.48,
            },
        },
        RAILING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.05,
                WIDTH: 0.08,
            },
            BUFFER: {
                WIDE: 0.3,
                UP: 0.4,
                // TODO : Maybe rename
                BOTTOM_UP: 0.045,
                HORIZONTAL_END: 0.382,
            },
        },
        BACK_COVER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                THICKNESS: 0.01,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.02,
                WIDTH: 0.08,
            },
            // TODO: the WIDE and HORIZONTAL_END needs to be half of actually required.
            // this is because HORIZONTAL_END is actually WIDE + HORIZONTAL_END
            BUFFER: {
                WIDE: 0.3,
                UP: 0,
                HORIZONTAL_END: 0.382,
                VERTICAL_END: 'ROW_SPACING',
                // TODO: Rename?
                BOTTOM_UP: 0.095,
                BACK_LEG_VERTICAL_END: 'ROW_SPACING',
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.02,
                WIDTH: 0.08,
            },
            BUFFER: {
                UP: 0.3825,
                WIDE: 0.3825,
            },
        },
    },
    FOUR_MMS_ONE_LEG: {
        NAME: 'Four MMS One Leg',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            // Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [10, 15, 20] }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 0.1 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [1], wideValues: [4] }),
            VALIDATION_CHECKS.PORTRAIT_ONLY,
            Object.assign(
                {}, VALIDATION_CHECKS.MODULE_SPACING,
                { moduleSpacingUp: 0.03, moduleSpacingWide: 0.03 },
            ),
            Object.assign({}, VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT, { mountHeight: 0.25 }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        FOOTING: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                LENGTH: 0.35,
                WIDTH: 0.35,
                HEIGHT: 0.15,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.8,
            },
            SINGLE_VERTICAL_ROW: true,
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.06,
                WIDTH: 0.13,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.8,
            },

        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.08,
                WIDTH: 0.05,
            },
            BUFFER: {
                TOP: 0.393,
                BOTTOM: 0.393,
            },
        },
        PURLIN: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.08,
            },
            BUFFER: {
                TOP: 0.3,
                BOTTOM: 0.3,
            },
        },
        BRACING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.04,
                LENGTH: 0.04,
            },
            RAFTER_BOTTOM: 0.078,
            // TODO:
            BOTTOM_PERCENT: 0.5,
            BRACING_CONNECTOR: {
                SIZE: {
                    HEIGHT: 0.1,
                },
            },
        },
    },
    FOUR_MMS_TWO_LEG: {
        NAME: 'Four MMS Two Leg',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            // Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [10, 15, 20] }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 0.1 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [1], wideValues: [4] }),
            VALIDATION_CHECKS.PORTRAIT_ONLY,
            Object.assign(
                {}, VALIDATION_CHECKS.MODULE_SPACING,
                { moduleSpacingUp: 0.03, moduleSpacingWide: 0.03 },
            ),
            Object.assign({}, VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT, { mountHeight: 0.25 }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        FOOTING: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                GENERAL: {
                    LENGTH: 0.6,
                    WIDTH: 0.6,
                },
                BOTTOM: {
                    LENGTH: 0.35,
                    WIDTH: 0.35,
                },
                HEIGHT: 0.3,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.5,
                HORIZONTAL_END: 0.35,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.13,
                WIDTH: 0.06,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.5,
                HORIZONTAL_END: 0.35,
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.06,
                WIDTH: 0.12,
            },
            BUFFER: {
                TOP: 0.3825,
                BOTTOM: 0.3825,
            },
        },
        PURLIN: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.06,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        BRACING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                // TODO: Don't know which is 80 and which is 40
                WIDTH: 0.04,
                LENGTH: 0.08,
            },
            RAFTER_TOP: 0.565,
            RAFTER_BOTTOM: 0.471,
            // TODO:
            BOTTOM_PERCENT: 0.5,
        },
    },
    GROUND_MOUNT_MMS: {
        NAME: 'Ground Mount MMS',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 0.1 }),
            Object.assign(
                {}, VALIDATION_CHECKS.TABLE_SIZE,
                { upValues: [2], wideValues: [10, 15] },
            ),
            Object.assign(
                {}, VALIDATION_CHECKS.MODULE_SPACING,
                { moduleSpacingUp: 0.03, moduleSpacingWide: 0.03 },
            ),
            Object.assign({}, VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT, { mountHeight: 0.3 }),
            VALIDATION_CHECKS.PORTRAIT_ONLY,
            // Object.assign({}, VALIDATION_CHECKS.MULTI_PROPERTY_CHECKS, {
            //     propertyChecks: [
            //         { tilt: 10, pitch: 6 },
            //         { tilt: 15, pitch: 6.5 },
            //         { tilt: 20, pitch: 7.5 },
            //     ],
            //     decidingFactor: 'tilt',
            // }),
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
        ],
        FOOTING: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                // TODO: Size of footing is not sure
                RADIUS: 0.35,
                HEIGHT: 0.25,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.35,
            },
            SINGLE_VERTICAL_ROW: true,
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.13,
                WIDTH: 0.06,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.35,
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.06,
                WIDTH: 0.12,
            },
            BUFFER: {
                TOP: 0.393,
                BOTTOM: 0.393,
            },
        },
        PURLIN: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.06,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        BRACING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                // TODO: Don't know which is 80 and which is 40
                WIDTH: 0.04,
                LENGTH: 0.08,
            },
            RAFTER_TOP: 0.565,
            RAFTER_BOTTOM: 0.471,
            // TODO:
            BOTTOM_PERCENT: 0.5,
        },
    },
    ELEVATED_MMS: {
        NAME: 'Elevated MMS',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            VALIDATION_CHECKS.PORTRAIT_ONLY,
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 0.03 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [4] }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [5, 3] }),
            Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 3.421 }),
            Object.assign(
                {}, VALIDATION_CHECKS.MODULE_SPACING,
                { moduleSpacingUp: 0.03, moduleSpacingWide: 0.03 },
            ),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE_WIDE_MULTIPLE, { multipleOf: 4 }),
            Object.assign({}, VALIDATION_CHECKS.ROW_SPACING, { rowSpacingValues: [0.32] }),
        ],
        RAILING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.05,
                WIDTH: 0.1,
            },
            BUFFER: {
                // TODO: This may not being properly used right now
                WIDE: 0,
                UP: 0,
                HORIZONTAL_END: 0,
                VERTICAL_END: 0,
            },
        },
        PILLAR: {
            STYLE: STYLES.STEEL,
            SIZE: {
                // LENGTH: 0.05,
                // WIDTH: 0.05,
                RADIUS: 0.05,
                HEIGHT: 3.008,
            },
            BUFFER: {
                UP: 0,
                WIDE: 0,
            },
        },
        PILLAR_CONNECTOR: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.05,
                HEIGHT: 0.05,
                LENGTH: 0.05,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.05,
                WIDTH: 0.05,
            },
            // TODO: the WIDE and HORIZONTAL_END needs to be half of actually required.
            // this is because HORIZONTAL_END is actually WIDE + HORIZONTAL_END
            BUFFER: {
                WIDE: 0,
                UP: 0.0125,
                HORIZONTAL_END: 0,
                VERTICAL_END: 0,
                BACK_LEG_VERTICAL_END: 'ROW_SPACING',
                MIN_Z: 2.975,
                TOP_Z: -0.02,
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.06,
                WIDTH: 0.12,
            },
            BUFFER: {
                TOP: 0,
                BOTTOM: 0,
            },
        },
        PURLIN: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.06,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        ROD_MESH: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.01,
                LENGTH: 0.01,
            },
            BUFFER: {
                TOP: 0.01,
            },
            VERTICAL_RODS: 6,
        },
    },
    FIXED_TILT_2500mm: {
        NAME: 'Fixed Tilt 2500mm',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            // Object.assign({}, VALIDATION_CHECKS.MOUNT_HEIGHT, { mountHeight: 2.5 }),
            Object.assign({}, VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT, { mountHeight: 2.5, type: 'fixed' }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SPACING, { tableSpacing: 0.1 }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE, { upValues: [3] }),
            Object.assign({}, VALIDATION_CHECKS.TABLE_SIZE_WIDE_MULTIPLE, { multipleOf: 3 }),
            Object.assign({}, VALIDATION_CHECKS.SUBARRAY_TILT, { tiltValues: [3] }),
            Object.assign({}, VALIDATION_CHECKS.MODULE_SPACING, { moduleSpacingWide: 0.02 }),
            VALIDATION_CHECKS.PORTRAIT_ONLY,
        ],
        FOOTING: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                LENGTH: 0.35,
                WIDTH: 0.35,
                HEIGHT: 0.35,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 1.35,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.13,
                WIDTH: 0.06,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.35,
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.06,
                WIDTH: 0.12,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        PURLIN: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.06,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        FRONT_BRACING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.04,
                LENGTH: 0.04,
            },
            BOTTOM_PERCENT: 0.6,
        },
        LEG_CONNECTOR: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.05,
                HEIGHT: 0.05,
                LENGTH: 0.05,
            },
            BUFFER: {
                WIDE: 1,
                UP: 0,
                HORIZONTAL_END: 1.35,
            },
        },
        SIDE_BRACING: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.04,
                LENGTH: 0.04,
            },
            BOTTOM_PERCENT: 0.8,
        },
    },
    FIXED_TILT_1m_3MMS: {
        NAME: 'Fixed Tilt with 1mtr 3MMS',
        VALIDATION_CHECKS: [
            VALIDATION_CHECKS.PARENT_NON_ZERO_TILT,
            VALIDATION_CHECKS.CHECK_FIXED_MOUNT,
            VALIDATION_CHECKS.LANDSCAPE_ONLY,
            Object.assign({}, VALIDATION_CHECKS.MINIMUM_MOUNT_HEIGHT, { mountHeight: 0.3 }),

        ],
        FOOTING: {
            STYLE: STYLES.CEMENT,
            SIZE: {
                LENGTH: 0.35,
                WIDTH: 0.35,
                HEIGHT: 0.35,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 1.35,
            },
        },
        LEG: {
            STYLE: STYLES.STEEL,
            SIZE: {
                LENGTH: 0.13,
                WIDTH: 0.06,
            },
            BUFFER: {
                WIDE: 0,
                UP: 0.3,
                HORIZONTAL_END: 0.35,
            },
        },
        RAFTER: {
            STYLE: STYLES.STEEL,
            SIZE: {
                HEIGHT: 0.06,
                WIDTH: 0.12,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
        PURLIN: {
            STYLE: STYLES.STEEL,
            SIZE: {
                WIDTH: 0.08,
                HEIGHT: 0.06,
            },
            BUFFER: {
                TOP: 0.2,
                BOTTOM: 0.2,
            },
        },
    },
};

export const BACK_COVER = 'backCover';

export const BLOCK_UTILS = 'blockUtil';

export const BRACING_UTILS = 'bracingUtil';

export const CLIP_UTILS = 'clipUtil';

export const FOOTING_UTILS = 'footingUtil';

export const FRONT_BRACING_UTILS = 'frontBracingUtil';

export const LEG_CONNECTOR_UTILS = 'legConnectorUtil';

export const LEG_UTILS = 'legUtil';

export const PILLAR_CONNECTOR_UTILS = 'pillarConnectorUtil';

export const PILLAR_UTILS = 'pillarUtil';

export const PURLIN_UTILS = 'purlinUtil';

export const RAFTER_UTILS = 'rafterUtil';

export const RAILING_UTILS = 'railingUtil';

export const ROD_MESH_UTILS = 'rodMeshUtil';

export const SIDE_BRACING_UTILS = 'sideBracingUtil';

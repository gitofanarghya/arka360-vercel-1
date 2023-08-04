export const VISUAL_STATES = {
    SELECT: 'selected',
    HOVER: 'hover',
    PARENT: 'parent',
    ERROR: 'error',
    DRAWING_ERROR: 'drawing-error',
    APP_HIGHLIGHT: 'app-highlight',
    APP_DISABLE: 'app-disable',
    DELETE_MODE: 'delete-mode',
    DEFAULT: 'default',
    DEFAULT_STATES: {
        DEFAULT: 'default-default',
        SOLAR_ACCESS: 'solar-access',
        SUN_SIMULATION: 'sun-simulation',
        HEATMAP: 'heatmap',
    },
    STRINGING: {
        ENABLED: 'enabled',
        DISABLED: 'disabled',
        ALREADY_STRINGED: 'already-stringed',
        INCORRECT_STRING_SIZE: 'incorrect-string-size',
        CORRECT_STRING_SIZE: 'correct-string-size',
    },
    MIRROR_MODE: 'mirror-mode',
    EDGE_HIGHLIGHT: 'edge-highlight',
};

export const MATERIAL_STATES = {
    SOLID: 'solid',
    TRANSLUCENT: 'translucent',
};

export const INVERTER_COLORS = {
    Color: [
        0x9A6324,
        0x469990,
        0xFFE119,
        0x222222,
        0xBFEF45,
        0xF58231,
        0x9D7F19,
        0x42D4F4,
        0x911EB4,
        0xA9A9A9,
        0xFF7F50,
        0xE5DA71,
        0xDCBEFF,
        0xF58231,
        0x42D4F4,
        0xFF6F91,
        0x008F7A,
        0x4B4453,
        0xCE7C1D,
        0xB90000,
    ]
}

export const COLOR_MAPPINGS = {
    GROUND: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xFFFFFF,
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.PARENT]: {
                MESH_COLOR: 0xd3fff7,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
            },
        },
    },
    POLYGON: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.PARENT]: {
                MESH_COLOR: 0xbffff3,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0x656970,
                PARAPET_COLOR: 0x29374a,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x656970,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
        },
    },
    SMARTROOF: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.PARENT]: {
                MESH_COLOR: 0xbffff3,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0x656970,
                PARAPET_COLOR: 0x29374a,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x656970,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
        },
    },
    CYLINDER: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xCCCCCC,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0xF5F5F5,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
                SETBACK_COLOR: 0x42a5f5,
            },
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.HOVER]: {
                MESH_COLOR: 0x00419F,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x00419F,
                PARAPET_EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.PARENT]: {
                MESH_COLOR: 0xbffff3,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                SETBACK_COLOR: 0xba000d,
                PARAPET_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.APP_HIGHLIGHT]: {
                MESH_COLOR: 0x00ffff,
            },
            [VISUAL_STATES.APP_DISABLE]: {
                MESH_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0x656970,
                PARAPET_COLOR: 0x29374a,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x29374a,
                EDGE_COLOR: 0xFFFFFF,
                PARAPET_COLOR: 0x656970,
                PARAPET_EDGE_COLOR: 0x656970,
                SETBACK_COLOR: 0x41698a,
            },
        },
    },
    WALKWAY: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    INVERTER: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                PILLAR_COLOR: 0xf44336,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xE5DA71,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xA9A9A9,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                PILLAR_COLOR: 0xf44336,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x0099ff,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    ACDB: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                PILLAR_COLOR: 0xf44336,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6b6b6b,
                EDGE_COLOR: 0x4e4e4e,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6b6b6b,
                EDGE_COLOR: 0x4e4e4e,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x6b6b6b,
                EDGE_COLOR: 0x4e4e4e,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6b6b6b,
                EDGE_COLOR: 0x4e4e4e,
                PILLAR_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
                PILLAR_COLOR: 0xf44336,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    SAFETY_LINE: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0xb5ffd5,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0xb5ffd5,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0xb5ffd5,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x00ff00,
                EDGE_COLOR: 0xb5ffd5,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    TREE: {
        // EDGE_COLOR required for outlinePoint Creation.
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x2D8725,
                CROWN_EDGE_COLOR: 0x3e2729,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.SELECT]: {
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.ERROR]: {
                TRUNK_MESH_COLOR: 0xf44336,
                TRUNK_EDGE_COLOR: 0xba000d,
                CROWN_MESH_COLOR: 0xf44336,
                CROWN_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.SELECT]: {
                TRUNK_MESH_COLOR: 0x3e2729,
                TRUNK_EDGE_COLOR: 0x654321,
                CROWN_MESH_COLOR: 0x00c853,
                CROWN_EDGE_COLOR: 0x00c853,
            },
            [VISUAL_STATES.ERROR]: {
                TRUNK_MESH_COLOR: 0xf44336,
                TRUNK_EDGE_COLOR: 0xba000d,
                CROWN_MESH_COLOR: 0xf44336,
                CROWN_EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                TRUNK_EDGE_COLOR: 0xffa000,
                CROWN_EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                EDGE_COLOR: 0xFFFFFF,
                TRUNK_MESH_COLOR: 0x423629,
                TRUNK_EDGE_COLOR: 0x423629,
                CROWN_MESH_COLOR: 0x2e7048,
                CROWN_EDGE_COLOR: 0x2e7048,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                TRUNK_MESH_COLOR: 0x423629,
                TRUNK_EDGE_COLOR: 0xFFFFFF,
                CROWN_MESH_COLOR: 0x2e7048,
                CROWN_EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    HANDRAIL: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    PROPERTY: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0x6d6d6d,
                EDGE_COLOR: 0x424242,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0xe0e0e0,
                EDGE_COLOR: 0x4e4e4e,
                OUTLINE_POINT_COLOR: 0xffffff,
            },
            [VISUAL_STATES.HOVER]: {
                // Will be implemented in future
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                MESH_COLOR: 0xffa000,
                EDGE_COLOR: 0xffa000,
                OUTLINE_POINT_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0x656970,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x656970,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    SUBARRAY: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                PANEL_EDGE_COLOR: 0xf7f7f7,
                PANEL_MESH_COLOR: 0x0062A3,
                PANEL_MESH_COLOR_MONO: 0x262626,
            },
            [VISUAL_STATES.ERROR]: {
                EDGE_COLOR: 0xba000d,
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
                PANEL_EDGE_COLOR: 0xf7f7f7,
                PANEL_MESH_COLOR: 0x0062A3,
                PANEL_MESH_COLOR_MONO: 0x262626,
            },
            [VISUAL_STATES.DEFAULT_STATES.SOLAR_ACCESS]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                EDGE_COLOR: 0x00c853,
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x2e7048,
                EDGE_COLOR: 0x2e7048,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x2e7048,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.DISABLED]: {
                MESH_COLOR: 0x4A6A79,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.ENABLED]: {
                MESH_COLOR: 0x2e7048,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.ALREADY_STRINGED]: {
                MESH_COLOR: 0x64B5F6,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.INCORRECT_STRING_SIZE]: {
                MESH_COLOR: 0xF44336,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.CORRECT_STRING_SIZE]: {
                MESH_COLOR: 0x74BC22,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    ROW: {

    },
    TABLE: {

    },
    PANEL: {
        [MATERIAL_STATES.SOLID]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x0062A3,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x007ACC,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x64b5f6,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
            },
            [VISUAL_STATES.DELETE_MODE]: {
                MESH_COLOR: 0xf44336,
            },
        },
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x0062A3,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.HEATMAP]: {
                MESH_COLOR: 0x0062A3,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.DEFAULT_STATES.SUN_SIMULATION]: {
                MESH_COLOR: 0x007ACC,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x64b5f6,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xf44336,
            },
            [VISUAL_STATES.DELETE_MODE]: {
                MESH_COLOR: 0xf44336,
            },
            [VISUAL_STATES.MIRROR_MODE]: {
                MESH_COLOR: 0x395263,
                EDGE_COLOR: 0xbdbdbd,
            },
            [VISUAL_STATES.EDGE_HIGHLIGHT]: {
                MESH_COLOR: 0x395263,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.ALREADY_STRINGED]: {
                MESH_COLOR: 0x64B5F6,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.INCORRECT_STRING_SIZE]: {
                MESH_COLOR: 0xF44336,
                EDGE_COLOR: 0xFFFFFF,
            },
            [VISUAL_STATES.STRINGING.CORRECT_STRING_SIZE]: {
                MESH_COLOR: 0x74BC22,
                EDGE_COLOR: 0xFFFFFF,
            },
        },
    },
    DIMENSION: {
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                EDGE_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.SELECT]: {
                EDGE_COLOR: 0x0000ff,
            },
            [VISUAL_STATES.ERROR]: {
                EDGE_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
            },
        },
    },
    LASSO_SELECTION: {
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                FIRST_POINT_DRAWING_COLOR: 0x00ff00,
                EDGE_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                EDGE_COLOR: 0xba000d,
                FIRST_POINT_DRAWING_COLOR: 0xba000d,
            },
            [VISUAL_STATES.DRAWING_ERROR]: {
                EDGE_COLOR: 0xffa000,
                FIRST_POINT_DRAWING_COLOR: 0xffa000,
            },
        },
    },
    IMAGE_MODEL: {
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0xffffff,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xba000d,
            },
        },
    },
    TEXT_BOX: {
        [MATERIAL_STATES.TRANSLUCENT]: {
            [VISUAL_STATES.DEFAULT_STATES.DEFAULT]: {
                MESH_COLOR: 0x00ff00,
            },
            [VISUAL_STATES.SELECT]: {
                MESH_COLOR: 0x00ff00,
            },
            [VISUAL_STATES.ERROR]: {
                MESH_COLOR: 0xba000d,
            },
        },
    },
};

export const TRANSLUCENT_OPACITY_FOR_MODELS = 0.25;

// For drawing
export const LINE_WIDTH = 2;
// TODO: Temporary solution
export const WALKWAY_2D_LINE_WIDTH = 4;

// Outline points
export const ROTATABLE_POINT_SIZE = 15;
export const POINT_SIZE = 8;
export const THIN_BORDER_OUTLINE_POINT_SIZE = 10;
export const THIN_BORDER_OUTLINE_POINT_IMAGE_URL =
    'https://design-studio-app.s3.ap-south-1.amazonaws.com/New_Project_1.png';
export const THICK_BORDER_OUTLINE_POINT_IMAGE_URL =
    'https://design-studio-app.s3.ap-south-1.amazonaws.com/outline_point.png';

export const SCALE_GUI_POINT_COLOR = 0xffffff;
export const SCALE_GUI_POINT_SIZE = 10;
export const SCALE_GUI_LINE_COLOR = 0xaaaaaa;
export const SCALE_GUI_LINE_WIDTH = 6;

export const EDGE_CENTRE_POINT_COLOR = 0xffa500;

export const IMAGE_MODEL_OPACITY = 0.83;

export const ONE_PIXEL_IMAGE_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAABlBMVEUAAAAFBATArXo5AAAAAXRSTlMAQObYZgAAAApJREFUCNdjYAQAAAMAAuF7xagAAAAYdEVYdFNvZnR3YXJlAGdpZjJhcG5nLnNmLm5ldJb/E8gAAAAASUVORK5CYII=';

// For edges in ground
export const GROUND_EDGE_LINE_WIDTH = 4;
export const GROUND_EDGE_LINE_COLOR = 0x66bb6a;
<template>
    <div id="profileTree">
        <el-tree
            v-show="isDataVisible"
            ref="profileTree"
            :data="data"
            default-expand-all
            highlight-current
            node-key="id"
            @node-click="openProfileDetails"/>
    </div>
</template>

<script>
import { serverBus } from '../../../main';

export default {
    name: 'ProfileTree',
    props: ['isDataVisible'],
    data() {
        return {
            msg: ' I am in allProfiles',
            currentPage: 'organisationSettings',
            data: [
                {
                    label: 'Settings',
                    id: 1,
                    children: [
                        {
                            id: 3,
                            label: 'General',
                        },
                        {
                            id: 4,
                            label: 'Losses',
                        },
                        {
                            id: 5,
                            label: 'AutoPanelPlacement',
                        },

                    ],
                },
                {
                    label: 'Objects',
                    id: 2,
                    children: [
                        {
                            id: 6,
                            label: 'Models',
                            children: [
                                {
                                    id: 9,
                                    label: 'Polygon',
                                },
                                {
                                    id: 10,
                                    label: 'Cylinder',
                                },
                                {
                                    id: 11,
                                    label: 'Smartroof',
                                },
                                {
                                    id: 12,
                                    label: 'Dormer',
                                },
                                {
                                    id: 13,
                                    label: 'Walkways',
                                },
                                {
                                    id: 14,
                                    label: 'Tree',
                                },
                            ],
                        },
                        {
                            id: 7,
                            label: 'Subarray',
                        },
                        {
                            id: 8,
                            label: 'AC',
                            children: [
                                {
                                    id: 13,
                                    label: 'Inverter',
                                },
                                {
                                    id: 14,
                                    label: 'ACDB',
                                },
                                {
                                    id: 15,
                                    label: 'AC Cable',
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    },
    methods: {
        openProfileDetails(data) {
            if (data.label === "Objects"
                || data.label === "Models"
                || data.label === "Settings"
                || data.label === "AC" 
            ) {
                // doing nothing
            } else {
                serverBus.$emit('component', data.label);
            }
        },

    },
    mounted() {
        // set current node. Id of same node which is set in current component default value
        // function here to check if the key for report is to be added or not
            this.data[0].children.push(
                {
                    id: 11,
                    label: 'Report'
                }
            );

        this.$refs.profileTree.setCurrentKey(3);
    },
};

</script>

<style type="text/css">

	#allProfiles .backButton {

		font-size: 23px;
		color: #303133;
	}

	#allProfiles .backButton:hover {
		font-weight: bold;
	}

	#allProfiles .custom-tree-node {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 14px;
		padding-right: 8px;
		color: #000;
	}
</style>


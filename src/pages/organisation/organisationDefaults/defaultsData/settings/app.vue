<template>
	<div id="settingsAppDefaults">
		<div>
			<el-table :data="profileData.default_table_types"
			          style="width: 100%; margin-top: 10px; border-top: none; border-left: none">
				<el-table-column type="expand" style="font-size: 11px;">
					<template slot-scope="props">
						<p> Vertical Module Spacing: 
							<display-length
							:metric-value="props.row.moduleSpacingUp"/>
						</p>
						<p class="paddingTopBottom"> Horizontal Module Spacing:
							<display-length
							:metric-value="props.row.moduleSpacingWide"/>
						</p>
						<p> Mount Height:
							<display-length
							:metric-value="props.row.mountHeight"/>
						</p>
					</template>
				</el-table-column>

				<el-table-column property="panelOrientation" label="Orientation"></el-table-column>

				<el-table-column label="Table Size">
					<el-table-column width="60" property="tableSizeUp" label="Up"></el-table-column>
					<el-table-column width="60" property="tableSizeWide" label="Wide"></el-table-column>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>

<script>

    export default {
        name: 'settingsAppDefaults',
        props: ['profileData'],

        data() {
            return {
                msg: ' I am in settingsAppDefaults',
            }
        },
    }
</script>

<style type="text/css">
	#settingsAppDefaults .el-table th > .cell {
		font-size: 13px;
	}
	#settingsAppDefaults .el-table__expanded-cell[class*=cell] {
		padding: 20px 30px 20px 50px;
	}
	#settingsAppDefaults .el-table--border th, .el-table--border td {
		border-right: none;
	}
	#settingsAppDefaults .el-table--border th {
		background-color: white;
	}
	#settingsAppDefaults .paddingTopBottom {
		padding: 5px 0;
	}
</style>

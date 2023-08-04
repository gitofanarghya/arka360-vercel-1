<template>
    <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="Name"></el-table-column>
        <el-table-column prop="rateType" label="Rate Type"></el-table-column>
        <el-table-column prop="amount" label="Amount">
            <template slot-scope="{ row }">
                <el-input-number v-if="row.editable" v-model="row.amount"></el-input-number>
                <span v-else>{{ row.amount }}</span>
            </template>
        </el-table-column>
        <el-table-column prop="quantity" label="Quantity"></el-table-column>
        <el-table-column prop="totalAmount" label="Total Amount"></el-table-column>
    </el-table>
</template>
  
<script>
export default {
    props: {
        tableData: {
            type: Array,
            required: true,
        },
    },
};
</script>
  
<template>
  <div>
    <BillComponent :designId="designId"
    :systemCost="systemCost" @systemTotalCost="systemTotalCost"
    />
    <!-- <item-dropdown :items="items" @item-selected="addItemToTable"></item-dropdown>
          <item-table :tableData="tableData"></item-table> -->
  </div>
</template>

<script>
import ItemDropdown from "./ItemDropdown.vue";
import ItemTable from "./ItemTable.vue";
import BillComponent from "./components/BillComponent.vue";

export default {
  components: {
    ItemDropdown,
    ItemTable,
    BillComponent,
  },
  props: {
    tableData: {
      type: Function,
      required: true,
    },
    designId: {
      type: String,
    },
    systemCost:{
      type:Boolean,
    }
  },
  data() {
    return {
      items: [
        { value: "additionalCost", label: "Additional Cost" },
        { value: "discount", label: "Discount" },
      ],
      tableData: [],
      data: this.$props.tableData,
      systemCosts:false,
    };
  },
watch:{
  systemCost:{
    immediate: true,
      handler(value) {
        console.log(value)
        this.systemCosts = value
        }
      }
  },
  mounted() {
    this.$props.systemCost
  },
  methods: {
    systemTotalCost(){
      this.$emit("systemTotalCost")
    },
    createTableAddData() {
      this.data.map((item) => console.log(item));
    },

    addItemToTable(value) {
      if (value === "additionalCost") {
        this.tableData.push({
          name: "Additional Cost",
          rateType: "Fixed",
          amount: 100,
          quantity: 1,
          totalAmount: 100,
          editable: false,
        });
      } else if (value === "discount") {
        this.tableData.push({
          name: "Discount",
          rateType: "Percentage",
          amount: 10,
          quantity: 1,
          totalAmount: -10,
          editable: true,
        });
      }
    },
  },
};
</script>

<template>
  <div>
    <ListTableView
      :tableData="tableData"
      :tableColumns="tableHeader"
      :getCellStyles="getCellStyles"
      :getHeaderStyles="getHeaderStyles"
      :paddingLeft="'16px'"
      :weight="600"
      :size="'16px'"
      :color="'#1C3366'"
      @updateValues="updateValues"
      @updateStatus="updateStatus"
      @updatePriority="updatePriority"
    />
  </div>
</template>

<script>
import debounce from "debounce";
import ListTableView from "../../../pages/designOrders/components/ListViewTable.vue";
export default {
  components: {
    ListTableView,
  },

  props: {
    tableData: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      tableHeader: [
        {
          id: "name",
          title: "Task Details",
          width: "340",
          type: "taskName",
        },
        // { id: "name", title: "Name", width: "140" },
        {
          id: "status",
          title: "Status",
          width: "180",
          type: "status_dropdown",
        },

        { id: "priority", title: "Priority", width: "140", type: "priority" },
        { id: "dueDate", title: "Due Date", width: "140" },
        { id: "homeOwner", title: "Homeowner", width: "140" },

        {
          id: "lead_stage",
          title: "Stage",
          width: "140",
        },
        {
          id: "assignees",
          title: "Assignee",
          width: "140",
        },
      ],
    };
  },
  mounted() {
    console.log(this.tableData);
  },
  methods: {
    getCellStyles(row, column) {
      console.log(row.status);
      if (column.id === "homeOwner") {
        return {
          color: " #409EFF",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "16px",
          height: "100%",
        };
      }
      if (column.id === "dueDate" && row.dueDate === "Today") {
        return {
          color: "#409EFF",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "16px",
        };
      }
      if (column.id === "dueDate" && row.dueDate === "OverDue") {
        return {
          color: "#FF0000",
        };
      }
    },

    getHeaderStyles() {
      const left = "left";
      return left;
    },

    updateValues: debounce(function (values) {
      this.$emit("update", values);
    }, 500),

    updateStatus(values) {
      this.$emit("updateStatus", values);
    },
    updatePriority(values) {
      this.$emit("updatePriority", values);
    },
  },
};
</script>

<style lang="scss" scoped></style>

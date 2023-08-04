<template>
  <div class="card">
    <CardHeader :heading="headingText">
      <slot name="header">
        <DropdownElement
          @selectionMade="setTableData"
          :dataOptions="computedDropdown"
        />
      </slot>
    </CardHeader>
    <div class="table_content">
      <el-table
        :data="tableData"
        :default-sort="{ prop: 'name', order: 'descending' }"
        style="width: 100%; max-height: 105vh;  overflow-y: scroll;"
        class="tableContainer"
      >
        <el-table-column prop="name" label="Name" :min-width="160" class="name">
          <template slot-scope="scope">
            <div
              style="
                display: flex;
                justify-content: flex-start;
                align-items: center;
              "
            >
              <div style="width: 30px; margin-right: 0.5rem">
                <el-avatar
                  :size="30"
                  :style="getAvatarStyle(scope.row.name)"
                  >{{ scope.row.abbreviation[0] }}</el-avatar
                >
              </div>
              <!-- {{ scope.row.name }} -->
              <el-tooltip placement="bottom" :hide-after="0">
                <div slot="content">
                  {{ scope.row.name }}
                </div>
                <div class="name-content">
                  {{ scope.row.name }}
                </div>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="phoneNo"
          label="Contact Details"
          :min-width="200"
        >
          <template slot-scope="scope">
            <div>
              <i class="el-icon-phone"></i>
              {{ scope.row.contact_details.phone }}
            </div>
            <div>
              <!-- <i class="bi bi-envelope"></i> -->

              <i class="el-icon-message"></i>
              {{ scope.row.contact_details.email }}
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="email" label="Email" width="150">
        <template slot-scope="scope">
          <i class="el-icon-s-promotion"></i>
          {{ scope.row.contact_details.email }}
        </template>
      </el-table-column> -->

        <el-table-column
          prop="amount"
          label="Close Date"
          :min-width="95"
          align="center"
        >
          <template slot-scope="scope">
            {{                   
                handleFormatDate(
                  scope.row.close_date,
                  typeConstants.date,
                  isUSFlag()
                )  
              }}
          </template>
        </el-table-column>

        <el-table-column
          prop="amount"
          label="Deal Amount"
          align="center"
          :min-width="100"
        >
          <template slot-scope="scope">
            {{ handleAbbreviateNumber(currency, scope.row.deal_amount) }}
          </template>
          <!-- <template slot-scope="scope"> ₹ {{ scope.row.deal_amount }} </template> -->
        </el-table-column>

        <slot></slot>
      </el-table>
    </div>
  </div>
</template>

<script>
import CardHeader from "./models/Card/CardHeader.vue";
import DropdownElement from "./models/DropdownElement.vue";
import { generateColorFromName,isUSFlagEnabled } from "../../../utils"
import { getLocaleAbbreviations, getFormattedCurrencyComas } from "../../../utils/numberFormat/currencyFormatter"
import { typeConstants, formatDateTime } from "../../../utils/dateFormatter"

export default {
  components: {
    CardHeader,
    DropdownElement,
  },
  props: {
    headingText: {
      type: String,
      default: "",
    },
    data: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      tableType: "amount",
      dropdownSelection: "",
      currency: "",
      tableData: [],
      typeConstants: typeConstants,
    };
  },
  
  computed: {
  },
  methods: {
    isUSFlag(){
      return isUSFlagEnabled();
    },
    handleFormatDate(isoDateTime, type, isUS) {
      return formatDateTime(isoDateTime, type, isUS);
    },
    handleAbbreviateNumber(currencyCode, value) {
      return getFormattedCurrencyComas(currencyCode, value);
    },
    formatter(row, column) {
      return row.address;
    },
    setTableData(data) {
      switch (data) {
        case "Weekly":
          this.tableData = this.$props.data.this_week.map((item) => ({
            ...item,
            abbreviation: this.generateInitials(item.name),
          }));
          break;
        case "Monthly":
          this.tableData = this.$props.data.this_month.map((item) => ({
            ...item,
            abbreviation: this.generateInitials(item.name),
          }));
          break;
        case "Quarterly":
          this.tableData = this.$props.data.this_quarter.map((item) => ({
            ...item,
            abbreviation: this.generateInitials(item.name),
          }));
          break;
        case "Yearly":
          this.tableData = this.$props.data.this_year.map((item) => ({
            ...item,
            abbreviation: this.generateInitials(item.name),
          }));
          break;
      }
    },
    convertDateFormat(dateString) {
      let date = DateTime.fromISO(dateString);
      const newDateString = `${date.day}-${date.month}-${date.year}`;
      return newDateString;
    },
    generateInitials(name) {
      if (!name || name.trim().length === 0) {
        return "N/A"; // Return empty string for blank names
      }

      const names = name.trim().split(" ");
      const initials = names.map((n) => n.charAt(0).toUpperCase());

      if (initials.length === 1) {
        return initials[0]; // Return single initial if only one name is available
      } else {
        return initials[0] + initials[initials.length - 1]; // Return first and last initials for multiple names
      }
    },
  },
  computed: {
    // computedData(data) {
    //     let td = []
    //     if (data) {
    //         td = data.map(item => ({ ...item, abbreviation: this.generateInitials(item.name) }))
    //     }
    //     return td
    // },
    computedDropdown() {
      return [
        { value: "Weekly", label: "This Week" },
        { value: "Monthly", label: "This Month" },
        { value: "Quarterly", label: "This Quarter" },
        { value: "Yearly", label: "This Year" },
      ];
    },
    getAvatarStyle() {
      return (value) => {
        const backgroundColor = generateColorFromName(value);
        return {
          marginRight: "0.5rem",
          marginTop: "5px",
          backgroundColor: backgroundColor,
        };
      };
    },
  },
  mounted() {
    this.dropdownSelection = this.computedDropdown[0].value;
    this.setTableData("Weekly");
    this.currency = JSON.parse(localStorage.getItem("organisation")).currency_code
    // Add dummy data to the table
    // this.tableData = [
    //   {
    //     name: "John Doe",
    //     contact_details: {
    //       phone: "1234567890",
    //       email: "john.doe@example.com",
    //     },
    //     close_date: "2023-05-30",
    //     deal_amount: 50000,
    //     abbreviation: "JD",
    //   },
    //   {
    //     name: "Jane Smith",
    //     contact_details: {
    //       phone: "9876543210",
    //       email: "jane.smith@example.com",
    //     },
    //     close_date: "2023-12-01",
    //     deal_amount: 75000,
    //     abbreviation: "JS",
    //   },
    //   // Add more dummy data objects as needed
    // ];
  },
};
</script>

<style scoped>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  height: 100%;
}

.el-table-column:nth-child(1),
.el-table-column:nth-child(2) {
  min-width: 30%;
}

.el-table-column:nth-child(3),
.el-table-column:nth-child(4) {
  min-width: 20%;
}
.el-table ::v-deep thead {
  font-family: "Switzer";
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  color: #222222;
}
.table_content {
  padding-left: 10px;
}
.el-table {
  font-family: "Switzer";
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 21px;
  color: #222222;
}

.el-table::v-deep th.el-table__cell .cell {
  word-break: break-word;
}
.name-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-table::before, .el-table--group::after, .el-table--border::after {
    background-color: transparent !important;
}
</style>

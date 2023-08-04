<template>
  <div>
    <ChildDropdown @selectedItem="addItem" :total="Totalpricing"></ChildDropdown>
    <hr class="hrAdders" />
    <ChildTable :items="tableItems" :total="Totalpricing" :countryCode="currency_code" @valueChanged="updateBackend"
      :tableHeaders="tableHeaders" @deleteData="deleteTableData" @updateTable="updateTable" @getSearch="getSearch">
    </ChildTable>
    <TableSummary :lineItems="tableItems" :total="Totalpricing" :countryCode="currency_code"></TableSummary>
  </div>
  <!-- <div v-else>
    <p style="text-align: center">Please Add the Pricing and Consumption</p>
  </div> -->
</template>

<script>
import ChildDropdown from "./ChildDropdown.vue";
import ChildTable from "./ChildTable.vue";
import TableSummary from "./TableSummary.vue";
import API from "../../../services/api";
import { adderRateType } from "./adderTypesConstants";
import { mapState } from "pinia";
import { useDesignStore } from "../../../stores/design";
import debounce from "debounce";

export default {
  components: {
    ChildDropdown,
    ChildTable,
    TableSummary,
  },
  props: {
    designId: {
      type: String,
    },
    systemCost: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      Totalpricing: 0,
      currency_code: "",
      tableItems: [],
      tableHeaders: [
        { id: "name", title: "Name", width: "160" },
        { id: "ratetype", title: "Rate Type", width: "130" },
        { id: "amount", title: "Amount", width: "120" },
        { id: "default_quantity", title: "Qty.", width: "80" },
        { id: "total", title: "Total Amount", width: "150" },
        {
          id: "actions",
          title: "",
          width: "40",
        },
        // { prop: "actions", label: "Actions", width: "140" },
      ],
      totalCaculation: 0,
      buildingWithPanelArea: 0,
      roofWithPanelArea: 0,
      underneathArrayArea: 0,
    };
  },
  watch: {
    systemCost(newValue, oldValue) {
      console.log(newValue, oldValue);

      if (newValue !== oldValue) {
        this.$emit("systemTotalCost");
      }
      if (newValue == true) {
        console.log("working");
        this.getDesign();
      }
    },
  },
  methods: {
    handleSwap(type, returnType, value) {
      console.log(value);
      let data = adderRateType().find((e) => e[type] === value);
      console.log(data);
      if (data === undefined) return value;
      console.log(data[returnType]);
      return data[returnType];
    },
    async postData(item) {
      await API.ADDERS_DISCOUNTS.POST_ALL_DESIGN_SUMMARY_DATA(item);
    },

    async getDesign() {
      const response = await API.DESIGNS.FETCH_DESIGN(this.$props.designId,true);
      this.buildingWithPanelArea =
        response.data.versions.scene == null
          ? null
          : response.data.versions.scene.buildingWithPanelArea;
      this.roofWithPanelArea =
        response.data.versions.scene == null
          ? null
          : response.data.versions.scene.roofWithPanelArea;
      this.underneathArrayArea =
        response.data.versions.scene == null
          ? null
          : response.data.versions.scene.underneathArrayArea;

      console.log(response.data.versions.scene);
      this.currency_code = response.data.project.currency_code;
      console.log(this.currency_code);

      this.Totalpricing =
        response.data.pricing.length > 0 ? response.data.pricing[0].cost : null;
      console.log(this.Totalpricing);
      this.totalCaculation =
        this.Totalpricing == null ? null : response.data.pricing[0].cost;
      const designData = response.data.adders_discounts.map((item) => {
        item.allow_amount_edit = item.adders_discounts.allow_amount_edit;
        item.allow_quantity_edit = item.adders_discounts.allow_quantity_edit;
        item.apply_incentives = item.adders_discounts.apply_incentives;
        item.created_at = item.adders_discounts.created_at;
        item.created_by = item.adders_discounts.created_by;

        switch (item.adders_discounts.rate_type) {
          case "percentage_of_system_cost":
            item.default_value = item.adders_discounts.default_percentage;
          default:
            item.default_value = item.adders_discounts.default_amount;
        }

        item.adder_discount_id = item.adders_discounts.id;
        item.is_homeowner_facing = item.adders_discounts.alse;
        item.modified_at = item.adders_discounts.modified_at;
        item.modified_by = item.adders_discounts.modified_by;
        item.name = item.adders_discounts.name;
        item.organisation = item.adders_discounts.organisation;
        item.rate_type = item.adders_discounts.rate_type;
        item.show_adder_total = item.adders_discounts.show_adder_total;
        item.sub_type = item.adders_discounts.sub_type;

        item.type = this.handleSwap(
          "value",
          "label",
          item.adders_discounts.type
        );

        item.ratetype = this.handleSwap(
          "value",
          "label",
          item.adders_discounts.rate_type
        );
        item.id = item.id;

        item.default_quantity = item.quantity;

        // switch (item.adders_discounts.rate_type) {
        //   case "per_watt_of_system_size":
        //     item.default_quantity =
        //       item.quantity * (this.summary.nameplateDcSize * 1000);
        //     break;
        //   default:
        //     item.default_quantity =
        //       item.quantity *
        //       this.bomData.filter((a) => a.component === "Modules")[0].count;
        // }

        switch (item.adders_discounts.rate_type) {
          case "percentage_of_system_cost":
            item.amount =
              item.amount > 0
                ? item.amount
                : item.adders_discounts.default_percentage;
            break;
          default:
            item.amount = item.amount; // No formatting for other rate_type values
        }
      });

      this.tableItems = response.data.adders_discounts;
    },

    async deleteTableData(id) {
      await API.ADDERS_DISCOUNTS.DELETE_DESIGN_ADDERS_AND_DISCOUNTS_ID(id);
      API.DESIGNS.FETCH_DESIGN(this.$props.designId,true);
    },
    removeCommasAndParseFloat(numberString) {
      let check= numberString + ""
      const numberWithoutCommas = check.replace(/,/g, '');
      const floatValue = parseFloat(numberWithoutCommas);
      return floatValue;
    },
    async updateTable(value) {
      console.log(value);

      const { id } = value;
      const amount = this.removeCommasAndParseFloat(value.amount);
      const default_quantity = this.removeCommasAndParseFloat(value.default_quantity);
      console.log(amount)
      let totalAmount = 0;

      if (value.rate_type === "percentage_of_system_cost") {
        totalAmount = (this.totalCaculation / 100) * (amount);
      } else {
        totalAmount = amount;
      }

      const data = {
        amount: amount,
        quantity: default_quantity,
      };

      console.log(data);
      await API.ADDERS_DISCOUNTS.PATCH_DESIGN_ADDERS_AND_DISCOUNTS_ID(id, data);
      API.DESIGNS.FETCH_DESIGN(this.$props.designId,true);
    },

    searchItem(item) {
      debounce(this.getSearch(item), 500);
    },

    async getSearch(term) {
      let { data } =
        await API.ADDERS_DISCOUNTS.FETCH_ALL_SEARCHED_ADDERS_AND_DISCOUNTS(
          term
        );
        
      console.log(data);
    },

    addItem(item) {
      console.log(item);
      item.ratetype = this.handleSwap("value", "label", item.rate_type);
      console.log(item);
      this.tableItems.push(item);
      let amounts = 0;
      let new_quantity = 1;

      const bom_data = this.bomData.filter((a) => a.component === "Modules");
      const bom_quantity = bom_data.map((item) => item.count);

      const new_bom_quantity = bom_quantity.reduce((a, b) => a + b, 0);

      console.log(this.buildingWithPanelArea);

      if (item.rate_type === "Per watt (of system size)") {
        new_quantity =
          item.default_quantity * (this.summary.nameplateDcSize * 1000);
      }

      if (item.rate_type === "Per panel") {
        new_quantity = item.default_quantity * new_bom_quantity;
      }

      switch (item.rate_type) {
        case "Percentage (of system cost)":
          amounts = item.default_percentage;
          break;
        default:
          amounts = item.default_amount;
      }
      switch (item.rate_type) {
        case "Per watt (of system size)":
          new_quantity =
            item.default_quantity * (this.summary.nameplateDcSize * 1000);
          break;
        case "Per panel":
          new_quantity = item.default_quantity * new_bom_quantity;
          break;
        default:
          new_quantity = item.default_quantity;
      }

      if (item.sub_type === "only_roof_containing_panels") {
        new_quantity = this.roofWithPanelArea
          ? item.default_quantity * parseInt(this.roofWithPanelArea * 10.7639)
          : item.default_quantity;
      }

      if (item.sub_type === "all_roof_faces_with_solar_panles") {
        new_quantity = this.buildingWithPanelArea
          ? item.default_quantity *
          parseInt(this.buildingWithPanelArea * 10.7639)
          : item.default_quantity;
      }
      if (item.sub_type === "underneath_arrays") {
        new_quantity = this.underneathArrayArea
          ? item.default_quantity * parseInt(this.underneathArrayArea * 10.7639)
          : item.default_quantity;
      }

      const data = {
        adders_discounts: item.id,
        amount: amounts,
        design: this.$props.designId,
        quantity: new_quantity,
      };

      console.log(data);

      this.postData(data);
      this.getDesign();

      this.updateTotal();
    },
    updateBackend() {
      // let amounts =
      //   item.rate_type === "percentage_of_system_cost"
      //     ? item.default_percentage
      //     : item.default_amount;

      // const data = {
      //   adders_discounts: item.id,
      //   amount: amounts,
      //   design: 69581,
      //   quantity: item.default_quantity,
      // };

      // console.log(data);

      // this.postData(data);
      // Update the backend here
      this.updateTotal();
    },
    updateTotal() {
      this.$forceUpdate();
    },
  },
  mounted() {
    this.$props.systemCost;
    console.log(this.summary.nameplateDcSize);
    this.getDesign();
    const data = this.bomData.filter((a) => a.component === "Modules");
    console.log(data.map((item) => item.count));
  },
  computed: {
    total() {
      let total = 0;
      for (const item of this.tableItems) {
        total += item.default_value * item.default_quantity;
      }
      return total;
    },
    ...mapState(useDesignStore, {
      bomData: "GET_BOM_DATA",
      summary: "GET_DESIGN_INFORMATION",
    }),
  },
};
</script>
<style scoped>
.hrAdders {
  margin-top: 16px;
  height: 0.5px;
  border: none;
}
</style>

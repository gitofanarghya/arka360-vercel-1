<template>
  <div class="designParentContainer">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      "
    >
      <router-link
        :to="{ name: 'leadSummary', leadId: $route.params.leadId }"
        class="backBtn"
        >Back</router-link
      >
    </div>
    <div class="designDetails">
      <designInformation class="design-card" />
      <designIncentive class="design-card" />
      <designFinancial class="design-card" />
      <storageCard class="design-card" />
      <designBOM class="design-card" />
      <div class="card">
        <div class="card_heading">
          <p>Adders and Discounts</p>
        </div>
        <div class="adderTable-container">
          <AdderTable :designId="designId" />
        </div>
      </div>
      <ChatBox v-show="orderData.id" :orderData="orderData" />
    </div>
  </div>
</template>

<script>
import designInformation from "../../../../src/pages/design/components/designInformation.vue";
import designIncentive from "../../../../src/pages/design/components/dsIncentives/designIncentive.vue";
import designFinancial from "../../design/components/designFinancial/designFinancial_new.vue";
import storageCard from "../../design/components/storageCard.vue";
import designBOM from "../../design/components/designBOM_new.vue";
import { mapState } from "pinia";
import { useProjectStore } from "../../../stores/project";
import ChatBox from "../../project/components/chatBox/chatBox.vue";
import { useDesignStore } from "../../../stores/design";
import AdderTable from "../../../components/adderTable/index.vue";

export default {
  components: {
    designInformation,
    designIncentive,
    designFinancial,
    storageCard,
    designBOM,
    ChatBox,
    AdderTable,
  },
  data() {
    return {
      orderData: null,
      designId: this.$route.params.designId,
    };
  },
  computed: {
    ...mapState(useProjectStore, {
      projectPermissionObject: "GET_PERMISISON_OBJECT",
      designDataFull: (state) => state,
      SET_DESIGN: (state) => state,
    }),
    ...mapState(useDesignStore, {
      summary: "GET_DESIGN_INFORMATION",
      ESInfo: "GET_EXPERT_SERVICE_INFO",
      designImageUrl: "GET_DESIGN_IMAGE",
    }),
  },
  created() {
    this.orderData = this.ESInfo;
    this.designId = this.$route.params.designId;
    this.orderData.project = this.designDataFull.id;
  },
  // watch: {
  //   "this.SET_DESIGN":{
  //       handler(value){

  //           this.orderData = this.SET_DESIGN;
  //       }
  //   }

  // },
};
</script>

<style scoped>
.designParentContainer {
  padding: 16px;
}

.designDetails {
  max-height: calc(100vh - 294px);
  overflow: hidden;
  overflow-y: scroll;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.backBtn {
  font-size: 14px;
  font-weight: 600;
  color: #777;
  display: flex;
  align-items: center;
  margin-top: 5px;
  cursor: pointer;
}

.backBtn::before {
  content: "";
  background: url("../assets/ArrowLeftShort.svg");
  width: 20px;
  height: 20px;
  display: block;
}
.adderTable-container {
  margin: 1rem;
  padding: 12px 0px;
  margin-bottom: 10px;
}
.card_heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 21px 16px 0px 16px;
  font-size: 16px;
  font-weight: 600 !important;
  color: black;
}
</style>

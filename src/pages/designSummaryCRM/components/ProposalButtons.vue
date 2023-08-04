<template>
  <div class="btnsContainer">
    <ReusableButton
      v-if="!isGenerationAlreadyCalculated"
      :loading="isLoading"
      :button="generationButtonData()"
      @click="calculateGeneration()"
    />

    <ReusableButton
      v-if="isGenerationAlreadyCalculated"
      :button="webProposalButtonData()"
      @click="navigateToWebProposal()"
    />

    <ReusableButton
      v-if="isGenerationAlreadyCalculated"
      :button="documentProposalButtonData()"
      @click="navigateToDocumentProposal()"
    />

    <ReusableButton
      v-if="isGenerationAlreadyCalculated"
      :button="designOverviewButtonData()"
      @click="navigateToDesignOverview()"
    />
  </div>
</template>

<script>
import ReusableButton from "./ReusableButton.vue";
import {
  isWebProposalDisabled,
  isDocProposalDisabled,
  isGenerationDisabled,
} from "../../../utils";
import { mapState, mapActions } from "pinia";
import { useDesignStore } from "../../../stores/design";

export default {
  props: {
    design: {
      type: Object,
      required: true,
    },
  },
  components: {
    ReusableButton,
  },
  data() {
    return {
      reusableButtonStyles: {
        fontSize: "12px",
        fontWeight: "600",
        height: "28px",
        padding: "6px 10px",
      },
      isLoading: false,
      tooltipMessageForNoModules:
        "Please add modules and inverters to the design, and calculate generation.",
    };
  },
  computed: {
    isGenerationAlreadyCalculated() {
      let design = this.$props.design;
      let nameplateDcSize = design?.versions?.summary?.nameplate_dc_size;
      let acSize = design?.versions?.summary?.ac_size;
      let annualGeneration = design?.annual_generation;
      if (nameplateDcSize && acSize && annualGeneration) {
        return true;
      } else return false;
    },
  },
  methods: {
    ...mapActions(useDesignStore, {
      SET_DESIGN: "SET_DESIGN",
    }),
    async calculateGeneration() {
      try {
        this.isLoading = true;
        await this.SET_DESIGN(this.$props.design.id);
        this.isLoading = false;
      } catch (e) {
        this.isLoading = false;
        console.error(e);
      }
    },
    generationButtonData() {
      return {
        label: "Calculate Generation",
        type: "primary",
        styleEnabled: { ...this.reusableButtonStyles },
        styleDisabled: { ...this.reusableButtonStyles },
        disableCondition: this.isGenerationDisabledForDesign(
          this.$props.design
        ),
        tooltip:
          "Please add modules and inverters to the design to calculate generation.",
      };
    },

    webProposalButtonData() {
      console.log(this.$props.design);
      return {
        label: "Web",
        type: "primary",
        styleEnabled: { ...this.reusableButtonStyles },
        styleDisabled: { ...this.reusableButtonStyles },
        disableCondition: this.isWebProposalDisabledForDesign(
          this.$props.design
        ),
        tooltip: this.tooltipMessageForProposal(this.$props.design),
      };
    },

    documentProposalButtonData() {
      return {
        label: "Doc",
        type: "primary",
        styleEnabled: { ...this.reusableButtonStyles },
        styleDisabled: { ...this.reusableButtonStyles },
        disableCondition: this.isDocumentProposalDisabledForDesign(
          this.$props.design
        ),
        tooltip: this.tooltipMessageForProposal(this.$props.design),
      };
    },

    designOverviewButtonData() {
      return {
        label: "3D",
        type: "primary",
        styleEnabled: { ...this.reusableButtonStyles },
        styleDisabled: { ...this.reusableButtonStyles },
        disableCondition: this.is3DLinkDisabledForDesign(this.$props.design),
        tooltip: this.tooltipMessageForNoModules,
        //why is this returning false even though the value exists?
      };
    },
    navigateToWebProposal() {
      const designUUID = this.$props.design?.versions?.reference_id;
      const route = { name: "webProposal", params: { designUUID } };

      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      // Open the URL in a new tab
      window.open(url, "_blank");
    },
    navigateToDocumentProposal() {
      const designId = this.$props.design?.id;
      const route = { name: "documentProposal", params: { designId } };
      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      // Open the URL in a new tab
      window.open(url, "_blank");
    },
    navigateToDesignOverview() {
      const designUUID = this.$props.design?.versions?.reference_id;
      const route = { name: "DesignOverview", params: { designUUID } };
      // Generate the absolute URL for the route
      const url = this.$router.resolve(route).href;
      // Open the URL in a new tab
      window.open(url, "_blank");
    },
    isGenerationDisabledForDesign(design) {
      return isGenerationDisabled({
        nameplateDcSize: design?.versions?.summary?.nameplate_dc_size,
        acSize: design?.versions?.summary?.ac_size,
      });
    },
    isWebProposalDisabledForDesign(design) {
      console.log(design);
      return isWebProposalDisabled({
        orderStatus: design?.request_expert_service?.order_status,
        nameplateDcSize: design?.versions?.summary?.nameplate_dc_size,
        acSize: design?.versions?.summary?.ac_size,
        financials: design?.pricing,
      });
    },
    tooltipMessageForProposal(design) {
      let summary = design?.versions?.summary;
      let financials = design?.pricing;
      if (summary?.nameplate_dc_size == null || summary?.ac_size == null) {
        return this.tooltipMessageForNoModules;
      } else if (
        (financials?.length > 0 && !financials?.[0]?.payback) ||
        financials?.length == 0
      ) {
        return "Please add consumption and pricing to the project.";
      }
    },
    isDocumentProposalDisabledForDesign(design) {
      return isDocProposalDisabled({
        orderStatus: design?.request_expert_service?.order_status,
        nameplateDcSize: design?.versions?.summary?.nameplate_dc_size,
        acSize: design?.versions?.summary?.ac_size,
        reportTemplate:
          design?.versions?.setting?.report_defaults?.template_name,
        financials: design?.pricing,
      });
    },
    is3DLinkDisabledForDesign(design) {
      // Disable 3D link if generation is not calculated
      let annualGeneration = design?.annual_generation;
      let acSize = design?.versions?.summary?.ac_size;
      let dcSize = design?.versions?.summary?.nameplate_dc_size;

      if (annualGeneration || (acSize && dcSize)) {
        return false;
      }

      return true;
    },
  },
};
</script>

<style scoped>
.btnsContainer {
  display: flex;
  flex-flow: row nowrap;
  gap: 8px;
}
</style>

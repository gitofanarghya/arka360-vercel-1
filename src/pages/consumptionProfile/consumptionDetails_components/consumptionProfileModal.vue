<template>
  <div>
    <div class="modal-backdrop">
      <div
        class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
      >
        <header class="modal-header" id="modalTitle">
          <slot name="header">Select Consumption Profile</slot>
          <button
            type="button"
            class="btn-close"
            @click="close"
            aria-label="Close modal"
          ></button>
        </header>

        <section class="modal-body no_padding" id="modalDescription">
          <slot name="body">
            <div class="consumption_details">
              <aside class="side_nav">
                <ul class="tab_list">
                  <li
                    :class="{ active: currentProfile.id == data.id }"
                    v-for="(data, i) in profileData"
                    :key="i"
                    @click="selectProfile(data)"
                  >
                    {{ data.Name }}
                  </li>
                </ul>
              </aside>
              <div class="aside_content">
                <div class="nav_details">
                  <div class="scroll_content">
                    <h4 class="consumptionHeading">{{currentProfile.Name}}</h4>
                    <div class="graph_area">
                      <LineChart
                        :chartData="chartData"
                        :reRender="chartCounter"
                        style="height: 30vh"
                      />
                    </div>
                    <p>{{ currentProfile.Description }}</p>
                  </div>
                </div>
                <div class="confirmation_btn">
                  <button
                    type="button"
                    class="btn btn-danger"
                    @click="confirmSelection"
                    aria-label="Close modal"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </slot>
        </section>
      </div>
    </div>
  </div>
</template>
<script>
import LineChart from "./lineChart.vue";
export default {
  name: "Modal",
  components: {
    LineChart,
  },
  props: {
    profileData: {
      type: Array,
      default() {
        return [
          {
            Consumption: "",
            Description: "",
            Name: "",
            Organisation: null,
            Organisation_array: [],
            Profile_type: "",
            id: -1,
          },
        ];
      },
    },
    selectedProfile: {
      type: Object,
      default() {
        return {
          Consumption: "",
          Description: "",
          Name: "",
          Organisation: null,
          Organisation_array: [],
          Profile_type: "",
          id: -1,
        };
      },
    },
  },
  data() {
    return {
      consumptionData: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
      currentProfile: {},
      chartCounter: 0,
      chartData: {
        // labels: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
        labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,11,12,13,14,15,16,17,18,19,20,21,22,23],
        datasets: [
          {
            label: "Consumption Data",
            backgroundColor: "#f87979",
            data: [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0],
          },
        ],
      },
    };
  },
  mounted() {
    this.currentProfile = this.selectedProfile;
    console.log("@@@@calling form mount",this.currentProfile);
    this.consumptionData = JSON.parse(
      this.currentProfile.Consumption
    ).hourlyCoefficients;
    this.chartData.datasets[0].data = this.consumptionData;
    // this.chartData.labels = this.consumptionData;
    this.chartCounter++;
  },
  methods: {
    close() {
      this.$emit("closeConsumptionProfileModal");
    },
    selectProfile(profile) {
      this.currentProfile = profile;
      this.consumptionData = JSON.parse(
        this.currentProfile.Consumption
      ).hourlyCoefficients;
      this.chartData.datasets[0].data = this.consumptionData;
      // this.chartData.labels = this.consumptionData;
      this.chartCounter++;
    },
    confirmSelection() {
      this.$emit("confirmProfile", this.currentProfile);
      this.$emit("closeConsumptionProfileModal");
    },
  },
};
</script>
<style scoped>
/* @import url(../styles/modalComponent.scss); */

.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  box-shadow: 2px 2px 20px 1px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  max-width: 790px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  height: auto !important;
  position: initial !important;
}



.modal-header,
.modal-footer {
  padding: 16px 24px;
}

.modal-header {
  position: relative;
  background-color: #e8edf2;
  color: #222;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  padding: 16px 24px !important; 
}

.modal-footer {
  flex-direction: column;
}

.modal-body {
  position: relative;
  padding: 16px 24px;
}
.modal-body.no_padding {
  padding: 0;
}

.btn-close {
  position: absolute;
  top: 14px;
  right: 14px;
  border: none;
  padding: 10px;
  cursor: pointer;
  background: transparent;
  width: 14px;
  height: 14px;
}
.btn-close:after,
.btn-close:before {
  content: "";
  position: absolute;
  left: 10px;
  width: 1.5px;
  height: 12px;
  background-color: #222;
  top: 3px;
}
.btn-close:after {
  transform: rotate(45deg);
}
.btn-close:before {
  transform: rotate(-45deg);
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}

.consumption_details {
  display: flex;
}

@media screen and (max-width: 800px) {
 .consumption_details {
  flex-direction: column;
}

.modal{
  width: 90%;
}

.aside_content{
  width: 100%;
}

.nav_details p {
  height: auto;
}
}

@media (min-width: 800px) {
  .graph_area {
    margin-right: 2px;
  }
}​

.side_nav {
  background: #f5f7fa;
  height: initial;
  min-width: 250px;
  width: 22%;
}

.aside_content{
  width: 72%;
}
.tab_list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tab_list li {
  padding: 12px 24px;
  transition: all 0.35s;
  cursor: pointer;
  margin-top: 1px;
  font-size: 13px;
  word-break: break-word !important;
}
.tab_list li:hover,
.tab_list li.active {
  background-color: #e8edf2;
}
.nav_details {
  padding: 24px 0;
}
.nav_details h4 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #222;
}
.nav_details p {
  font-size: 16px;
  font-weight: normal;
  margin: 14px 0 0;
  color: #222;
  line-height: 1.5;
  word-break: break-word !important;
  height: 72px;
}
.graph_area {
  border: 1px solid #999;
  margin-top: 16px;
}
.graph_area img {
  width: 100%;
}
.confirmation_btn {
  border-top: 1px solid #f5f7fa;
  padding: 20px 24px;
  display: flex;
  justify-content: flex-end;
}
.nav_details .scroll_content {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 0 24px;
}

.btn-danger {
  color: #ffffff;
    background-color: #409eff;
    border-color: #409eff;
    padding: 12px 20px;
    font-size: 14px;
    border-radius: 4px;
    border: none;
    font-weight: 700;
}
.consumptionHeading{
  word-break:break-word;
}

@media screen and (max-width: 800px) {
.aside_content{
  width: 100%;
}

.nav_details p {
  height: auto;
}
}

@media screen and (max-width: 500px) {
  .modal-body.no_padding{
    height: 80vh;
    overflow: hidden;
    overflow-y: scroll;
  }
}

</style>

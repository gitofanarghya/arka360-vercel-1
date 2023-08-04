<template>
  <section>
    <div class="container" id="scroll-bar">
      <div class="flex justify-center">
        <div>
          <div class="min-h-screen flex overflow-x-scroll overflow-y-scroll">
            <div
              v-for="column in columns"
              :key="column.title"
              class="bg-gray-100 rounded-lg px-3 py-3 column-width rounded mr-4"
            >
              <div v-if="column.title !== 'addSection'">
                <div class="Header">
                  <p class="header-label">
                    &#9679; {{ getHeaderTitle(column.title) }}
                  </p>
                  <p class="font-semibold font-sans tracking-wide text-sm">
                    {{ page }} {{ column.tasks.length }}
                  </p>
                </div>

                <!-- Draggable component comes from vuedraggable. It provides drag & drop functionality -->
                <div class="crad-columns">
                  <div>
                    <draggable
                      :list="column.tasks"
                      :animation="200"
                      class="ghost-card"
                      group="tasks"
                    >
                      <!-- Each element from here will be draggable and animated. Note :key is very important here to be unique both for draggable and animations to be smooth & consistent. -->
                      <!-- <div v-if="column.tasks.length > 0"> -->

                      <task-card
                        v-for="task in column.tasks"
                        :key="task.id"
                        :task="task"
                        @select-card="handleSelectCard"
                      ></task-card>
                      <!-- <task-card
                  v-for="task in tableDetails"
                  :key="task.id"
                  :task="task"
                  @select-card="handleSelectCard"
                ></task-card> -->

                      <!-- </div> -->
                      <!-- </transition-group> -->
                    </draggable>
                  </div>
                  <div
                    class="create_btn"
                    @click.native.stop="handleCreate(column)"
                  >
                    + Create New
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="create_section_btn" @click="handleCreated(column)">
                  + Create Section
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import draggable from "vuedraggable";
import TaskCard from "./taskCard.vue";
export default {
  name: "App",
  components: {
    TaskCard,
    draggable,
  },

  computed: {
    kanBanData() {
      var kanBanColumns = [
        {
          title: "incomplete",
          tasks: [],
        },
        {
          title: "in_process",
          tasks: [],
        },

        {
          title: "pending",
          tasks: [],
        },
        {
          title: "complete",
          tasks: [],
        },
        {
          title: "order_placed",
          tasks: [],
        },
        {
          title: "rejected",
          tasks: [],
        },
        {
          title: "cancelled",
          tasks: [],
        },
        {
          title: "addSection",
          tasks: [],
        },
      ];
      console.log(this.$props.dataTable);
      const result = this.$props.dataTable.reduce((acc, obj) => {
        if (!acc[obj.order_status]) {
          acc[obj.order_status] = []; // Create an empty array if the column doesn't exist in the accumulator
        }
        acc[obj.order_status].push(obj); // Add the object to the array for the corresponding column
        return acc;
      }, {});
      console.log(result);

      kanBanColumns.map((item) => {
        // item.name=item.project?item.project.name:item.name
        console.log();
        if (result[item.title]) {
          item.tasks = result[item.title];
          console.log(item.tasks);
        }
      });
      const data = kanBanColumns;

      console.log(data);
      return data;
    },
  },
  data() {
    return {
      tableDetails: [
        {
          name: "",
          phone: 34235536236,
          email: "tonystark@gamail.com",
          color: "red",
          order_status: "incomplete",
        },
        {
          name: "patrick bateman",
          phone: 34235536236,
          email: "tonystark@gamail.com",
          color: "blue",
        },
        {
          name: "andrew",
          phone: 34235536236,
          email: "tonystark@gamail.com",
          color: "green",
        },
        {
          name: "tristian",
          phone: 34235536236,
          email: "tonystark@gamail.com",
          color: "blue",
        },
        {
          name: "dishwasher",
          phone: 34235536236,
          email: "tonystark@gamail.com",
          color: "red",
        },
        {
          name: "kitchen",
          phone: 34235536236,
          email: "tonystark@gamail.com",
          color: "green",
        },
        {
          name: "dishes",
          phone: 34235536236,
          email: "tonystark@gamail.com",
          color: "grey",
        },
        {
          name: "coffee",
          phone: 34235536236,
          email: "tonystark@gamail.com",
          color: "lightGrey",
        },
        {
          name: "women",
          phone: 34235536236,
          email: "tonystark@gamail.com",
        },
      ],
      columns: [],
      kandBancol: ["Incompleted", "Inprocess"],

      // columns: [
      //   {
      //     title: "Backlog",
      //     tasks: [
      //       {
      //         id: 1,
      //         title: "Add discount code to checkout page",
      //         date: "Sep 14",
      //         type: "Feature Request",
      //       },
      //       {
      //         id: 2,
      //         title: "Provide documentation on integrations",
      //         date: "Sep 12",
      //       },
      //       {
      //         id: 3,
      //         title: "Design shopping cart dropdown",
      //         date: "Sep 9",
      //         type: "Design",
      //       },
      //       {
      //         id: 4,
      //         title: "Add discount code to checkout page",
      //         date: "Sep 14",
      //         type: "Feature Request",
      //       },
      //       {
      //         id: 5,
      //         title: "Test checkout flow",
      //         date: "Sep 15",
      //         type: "QA",
      //       },
      //     ],
      //   },
      //   {
      //     title: "In Progress",
      //     tasks: [
      //       {
      //         id: 6,
      //         title: "Design shopping cart dropdown",
      //         date: "Sep 9",
      //         type: "Design",
      //       },
      //       {
      //         id: 7,
      //         title: "Add discount code to checkout page",
      //         date: "Sep 14",
      //         type: "Feature Request",
      //       },
      //       {
      //         id: 8,
      //         title: "Provide documentation on integrations",
      //         date: "Sep 12",
      //         type: "Backend",
      //       },
      //     ],
      //   },
      //   {
      //     title: "Review",
      //     tasks: [
      //       {
      //         id: 9,
      //         title: "Provide documentation on integrations",
      //         date: "Sep 12",
      //       },
      //       {
      //         id: 10,
      //         title: "Design shopping cart dropdown",
      //         date: "Sep 9",
      //         type: "Design",
      //       },
      //       {
      //         id: 11,
      //         title: "Add discount code to checkout page",
      //         date: "Sep 14",
      //         type: "Feature Request",
      //       },
      //       {
      //         id: 12,
      //         title: "Design shopping cart dropdown",
      //         date: "Sep 9",
      //         type: "Design",
      //       },
      //       {
      //         id: 13,
      //         title: "Add discount code to checkout page",
      //         date: "Sep 14",
      //         type: "Feature Request",
      //       },
      //     ],
      //   },
      //   {
      //     title: "Done",
      //     tasks: [
      //       {
      //         id: 14,
      //         title: "Add discount code to checkout page",
      //         date: "Sep 14",
      //         type: "Feature Request",
      //       },
      //       {
      //         id: 15,
      //         title: "Design shopping cart dropdown",
      //         date: "Sep 9",
      //         type: "Design",
      //       },
      //       {
      //         id: 16,
      //         title: "Add discount code to checkout page",
      //         date: "Sep 14",
      //         type: "Feature Request",
      //       },
      //     ],
      //   },
      // ],
      // columns:this.kanBanData
    };
  },
  props: {
    dataTable: {
      type: Array,
      required: true,
    },
    handleOrderClick: {
      type: Function,
      required: true,
    },
    order: {
      required: true,
    },
    buttonsData: {
      type: Array,
    },
    page: {
      type: String,
    },
    handleCreate: {
      type: Function,
    },
  },
  methods: {
    async handleChange(value) {
      if (!value) return;
      let { id } = value.added.element;
      let i = 0,
        newStatus;
      while (i < this.columns.length) {
        let status = this.columns[i].tasks.find((e) => e.id === id);
        if (status) {
          newStatus = this.columns[i].title;
          try {
            let res = await API.DESIGN_ORDERS.UPDATE_DESIGN_ORDER_METHOAD(id, {
              order_status: newStatus,
            });
            return res;
          } catch (err) {
            console.log(err.message);
          }
        }
        i++;
      }
    },
    getHeaderTitle(value) {
      switch (value) {
        case "incomplete":
          return "Incomplete";
        case "in_process":
          return "In-Process";
        case "pending":
          return "Pending";
        case "complete":
          return "Completed";
        case "order_placed":
          return "Order-Placed";
        case "rejected":
          return "Rejected";
        case "cancelled":
          return "Cancelled";
        default:
          return "";
      }
    },
    handleIntermediateViewDesign(data) {
      console.log("in parent");
      this.$emit("handleDesign", data);
      //window.open(`${BASE_URL_FOR_REPORT_IMAGES}studio/${data}`);
    },
    handleIntermediateViewSurvey(data) {
      console.log("inparent");
      //console.log(data);
      this.$emit("viewSurveyEvent", data);
      //const url = `${SITE_SURVEY_LINK}${data}/tsl`;
      window.open(url);
    },
    handleSelectCard(data) {
      console.log(data);
      this.$props.handleOrderClick(true);

      this.$emit("update:order", data);
    },
    handleCreated(data) {
      console.log(data);
      this.$props.handleCreate(true);
    },
  },
  mounted() {
    this.columns = this.kanBanData;
    console.log("data", this.$props.dataTable);
  },
  watch: {
    dataTable(newVal, oldVal) {
      console.log(this.kanBanData);
      this.columns = this.kanBanData;
    },
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 4px;
}

#scroll-bar {
  scrollbar-width: none;
}
.right_section {
  /* background: var(--step-50); */
  padding-top: 2rem;
  padding-right: 2rem;
  scrollbar-width: none;
}
.column-width {
  min-width: 320px;
  width: 320px;
}
@media (min-width: 1281px) {
  .main-controller .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }
}
@media (min-width: 1281px) {
  .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }
}
/* Unfortunately @apply cannot be setup in codesandbox, 
but you'd use "@apply border opacity-50 border-blue-500 bg-gray-200" here */
.header-label {
  color: #409eff;
}
.crad-columns {
  max-height: 60vh;
  overflow-y: scroll;
}
.ghost-card {
  opacity: 1;
  /* background: #f7fafc; */
  /* max-height: 60vh;
  overflow-y: scroll; */
}
.flex {
  display: flex;
}

.min-h-screen {
  min-height: 25rem;
  max-height: 100%;
  margin-top: 1rem;
}

.py-12 {
  padding-top: 3rem;
}

.column-width {
  width: 320px;
}

.bg-gray-100 {
  padding-bottom: 12px;
  padding-top: 2px;
  box-shadow: inset;
  /* background-color: #f7fafc; */
  min-width: 390px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.mr-4 {
  margin-right: 1rem;
}

.text-gray-700 {
  color: #4a5568;
  position: sticky;
  border: #f7fafc;
  /* background-color: #f7fafc; */
  width: 100%;
  height: 2rem;
  /* align-items: center; */
  /* text-align: center; */
  border-radius: 5;
}

.font-semibold {
  font-weight: 500;
  background: #e8edf2;
  color: #1c3366;
  border-radius: 4px;
  padding: 5px;
}

.font-sans {
  font-family: sans-serif;
}

.tracking-wide {
  letter-spacing: 0.05em;
}

.text-sm {
  font-size: 0.65rem;
}

.ghost-card {
  opacity: 1;
}

.cursor-move {
  cursor: move;
}
</style>
<style scoped>
.container {
  max-width: 100%;
  /* margin-left: 2rem; */
  /* background: var(--step-50); */
  overflow-x: auto;
  max-height: 80vh;
  overflow-y: hidden;
  scrollbar-width: none;
}

.content_section {
  padding: 24px;
  min-height: calc(100vh - 100px);
}
.Header {
  display: flex;
  justify-content: space-between;
  background-color: #f7fafc;
  padding: 0.75rem;
  align-items: center;
  align-content: center;
  margin-bottom: 1rem;
  border-radius: 4px;
}
.create_btn {
  border: 1px dashed #d9d9d9;
  /* border-radius: 6px; */
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding: 10px 10px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  /* margin:1rem */
}
.create_section_btn {
  border: 2px dashed #d9d9d9;
  /* border-radius: 6px; */
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding: 10px 10px;
  margin-bottom: 1rem;
}
</style>

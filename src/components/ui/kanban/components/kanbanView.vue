<template>
  <section>
    <div class="container" id="scroll-bar" @click="selectCard()">
      <div class="flex justify-center">
        <div>
          <div class="min-h-screen flex overflow-x-scroll overflow-y-scroll">
            <div
              v-for="column in dataTable"
              :key="column.title"
              class="bg-gray-100 rounded-lg px-3 column-width rounded mr-4"
            >
              <div v-if="column.title !== 'addSection'">
                <div class="Header">
                  <p class="header-label">
                    <!-- &#9679; {{ getHeaderTitle(column.title) }} -->
                    &#9679; {{ column.title }}
                  </p>
                  <p class="font-semibold font-sans tracking-wide text-sm">
                    {{ column?.count || column.tasks.length }} {{ page }}
                  </p>
                </div>

                <!-- Draggable component comes from vuedraggable. It provides drag & drop functionality -->
                <div
                  class="crad-columns"
                  id="kanban-scroll"
                  :style="{
                    minHeight: `calc(100vh - ${offSetHeight}) !important`,
                    maxHeight: `calc(100vh - ${offSetHeight}) !important`,
                    overflowY: 'scroll',
                  }"
                  @scroll="handleScroll($event, column)"
                >
                  <!-- Non Dragable Kanban board -->
                  <div v-if="selectedColumnType === 'delivery_type'">
                    <div
                      v-for="(task, index) in column.tasks"
                      :key="task.id"
                      @click.navtive.stop="selectCard(task.id, task)"
                      :class="{
                        'card-selected': task.id === selectedCardId,
                      }"
                      ref="columnRef"
                    >
                      <task-card
                        :task.sync="task"
                        @select-card="handleSelectCard"
                        :buttonsData="buttonsData"
                        :page="page"
                        @component-name="handleReminder"
                        :taskIndex="index"
                        :selectedColumnType="column.columnType"
                        :selected="
                          task.id === selectedCardId ? '2px solid black' : ''
                        "
                      ></task-card>
                    </div>
                  </div>
                  <!-- <Divscroll /> -->
                  <div v-else>
                    <draggable
                      :list="column.tasks"
                      :animation="200"
                      @start="onDragStart($event, column)"
                      class="ghost-card"
                      group="tasks"
                      @change="handleUpdate($event, column)"
                    >
                      <!-- Each element from here will be draggable and animated. Note :key is very important here to be unique both for draggable and animations to be smooth & consistent. -->
                      <!-- <div v-if="column.tasks.length > 0"> -->
                      <div
                        v-for="(task, index) in column.tasks"
                        :key="task.id"
                        @click.navtive.stop="selectCard(task.id, task)"
                        :class="{
                          'card-selected': task.id === selectedCardId,
                        }"
                        ref="columnRef"
                      >
                        <task-card
                          :task.sync="task"
                          @select-card="handleSelectCard"
                          :buttonsData="buttonsData"
                          :page="page"
                          @component-name="handleReminder"
                          :selectedColumnType="column.columnType"
                          :taskIndex="index"
                          :selected="
                            task.id === selectedCardId ? '2px solid black' : ''
                          "
                        ></task-card>
                      </div>

                      <div
                        v-if="column.tasks.length < 3"
                        class="default-drop-zone"
                        @dragenter="handleDragEnter(column)"
                        @dragleave="handleDragLeave"
                        @drop="handleDrop"
                        @dragover.prevent
                        :style="{
                          minHeight: `calc(100vh - ${
                            14 * column.tasks.length
                          }rem - ${offSetHeight}) !important`,
                          maxHeight: `calc(100vh - ${
                            14 * column.tasks.length
                          }rem - ${offSetHeight}) !important`,
                          overflowY: 'scroll',
                        }"
                      ></div>

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

                  <!-- <div
                    class="create_btn"
                    @click="handleCreated(column)"
                    v-if="page == 'Leads'"
                    :style="{ marginTop: column.tasks.length > 0 ? 0 : '1rem' }"
                  >
                    + Create New
                  </div> -->
                </div>
              </div>
              <div v-else>
                <div
                  class="create_section_btn"
                  @click="handleCreateNew(column)"
                >
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
import API from "@/services/api/";

export default {
  name: "App",
  components: {
    TaskCard,
    draggable,
  },

  computed: {
    kanBanData() {
      console.log(this.$props.dataTable);
      var kanBanColumns = this.$props.kanBanColumns;
      let columnType = this.$props.columnType;
      // var kanBanColumns = [
      //   {
      //     title: "incomplete",
      //     tasks: [],
      //   },
      //   {
      //     title: "in_process",
      //     tasks: [],
      //   },

      //   {
      //     title: "pending",
      //     tasks: [],
      //   },
      //   {
      //     title: "complete",
      //     tasks: [],
      //   },
      //   {
      //     title: "order_placed",
      //     tasks: [],
      //   },
      //   {
      //     title: "rejected",
      //     tasks: [],
      //   },
      //   {
      //     title: "cancelled",
      //     tasks: [],
      //   },
      //   // {
      //   //   title: "addSection",
      //   //   tasks: [],
      //   // },
      // ];
      console.log(this.$props.kanBanColumns);

      const result = this.$props.dataTable.reduce((acc, obj) => {
        if (!acc[obj[columnType]]) {
          acc[obj[columnType]] = []; // Create an empty array if the column doesn't exist in the accumulator
        }
        acc[obj[columnType]].push(obj); // Add the object to the array for the corresponding column
        return acc;
      }, {});
      console.log(result);

      kanBanColumns.map((item) => {
        // item.name=item.project?item.project.name:item.name
        console.log(item);
        if (result[item.title]) {
          item.tasks = result[item.title];
          console.log(item.tasks);
        }
      });
      const data = kanBanColumns;

      console.log(data);
      return this.$props.dataTable;
    },
  },
  data() {
    return {
      hoveredColumn: "",
      selectedCardId: "",
      selected: false,
      divHeight: 50,
      previousColumn: "",
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
    kanBanColumns: {
      type: Array,
      required: true,
      default: [],
    },
    getHeaderTitle: {
      type: Function,
    },
    columnType: {
      type: String,
      required: true,
    },
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
    handleChange: {
      type: Function,
    },
    drawer: {
      type: Boolean,
    },
    drawerStage: {
      type: String,
    },
    componentName: {
      type: String,
    },
    drawerSize: {
      type: Number,
    },
    handleCreate: {
      type: Function,
    },
    leadDrawer: {
      type: Boolean,
    },
    loadMoreData: {
      type: Function,
    },
    selectedColumnType: {
      type: String,
    },
    offSetHeight: {
      type: String,
    },
    showCreateDrawer: {
      type: Boolean,
    },
    selectedCard: {
      type: Boolean,
    },
  },
  methods: {
    handleDragEnter(column) {
      // Update the hoveredColumn when the drag enters the default drop zone
      this.hoveredColumn = column.title;
      console.log(column);
    },
    handleDragLeave() {
      // Reset the hoveredColumn when the drag leaves the default drop zone
      this.hoveredColumn = null;
    },
    handleDrop(event) {
      // Handle the drop event
      // You can access the dropped data from the event and perform necessary actions
      // For example, you can reorder the tasks within the column
    },
    onDragStart(e, column) {
      this.previousColumn = column;
    },
    handleUpdate(value, column) {
      console.log(value);
      console.log(this.$props.dataTable);
      if (value.added) {
        if (value.added.element) {
          this.$emit(
            "handleChange",
            value.added.element,
            this.$props.dataTable
          );
        }

        this.$props.dataTable.map((d) => {
          if (d.title === column.title) {
            d.count = d.count + 1;
            console.log(d.count, d.tasks.length);
            if (d.count > 9 && d.tasks.length < 10) {
              this.$emit("handleColumnNumber", column);
              console.log("hdsghfgsdafgsd");
            }
          }
          if (d.title === this.previousColumn.title) {
            console.log(d.count, d.tasks.length);
            d.count = d.count - 1;
            if (d.count > 9 && d.tasks.length < 10) {
              this.$emit("handleColumnNumber", this.previousColumn);
              console.log("hdsghfgsdafgsd");
            }
          }
        });
      }
      // console.log(value);
      // if (!value) return;
      // let { id } = value.added.element;
      // let i = 0,
      //   newStatus;
      // while (i < this.columns.length) {
      //   let status = this.columns[i].tasks.find((e) => e.id === id);
      //   if (status) {
      //     newStatus = this.columns[i].title;
      //     console.log(newStatus);
      //     try {
      //       let res = await API.DESIGN_ORDERS.UPDATE_DESIGN_ORDER_METHOAD(id, {
      //         order_status: newStatus,
      //       });
      //       return res;
      //     } catch (err) {
      //       console.log(err.message);
      //     }
      //   }
      //   i++;
      // }
    },
    // getHeaderTitle(value) {
    //   switch (value) {
    //     case "incomplete":
    //       return "Incomplete";
    //     case "in_process":
    //       return "In-Process";
    //     case "pending":
    //       return "Pending";
    //     case "complete":
    //       return "Completed";
    //     case "order_placed":
    //       return "Order-Placed";
    //     case "rejected":
    //       return "Rejected";
    //     case "cancelled":
    //       return "Cancelled";
    //     default:
    //       return "";
    //   }
    // },
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
      this.selected = true;
      console.log(data);
      this.$props.handleOrderClick(data);

      this.$emit("update:order", data);
    },

    selectCard(cardId, task) {
      console.log(task);
      if (task) {
        this.selectedCardId = cardId;
      } else {
        this.selectedCardId = "";
      }
    },
    handleCreated(column) {
      console.log("crete", column);
      this.$props.handleCreate(column);
      this.$emit("update:componentName", "createLead");
      this.$emit("update:drawer", true);
      this.$emit("update:drawerStage", column.title);
      // this.$props.handleOrderClick(true);
    },
    handleReminder(data, value) {
      this.selectCard(value.id, value);
      this.$emit("update:drawerSize", 500);
      // this.$emit("update:componentName", data);
      this.$emit("update:showCreateDrawer", true);
      this.$emit("updateReminder");
      this.$emit("update:order", value);
    },

    async handleScroll(event, col) {
      // Calculate the scroll position
      const container = document.querySelector(".crad-columns");
      const element = document.getElementById("kanban-scroll");
      const scrollContainer = event.target;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      const scrollPosition = container.scrollTop;

      if (scrollTop + clientHeight >= scrollHeight - 1 && col.next) {
        this.$props.loadMoreData(col);

        this.increaseDivHeight();
      }

      // Check if the user has reached the bottom of the container
      const containerHeight = container.offsetHeight;
      const contentHeight = container.scrollHeight;
      const isAtBottom = scrollPosition + containerHeight >= contentHeight;

      // If the user has reached the bottom, perform the desired action
      if (isAtBottom) {
        // Fetch or load more data
      }
    },
    // handleScroll(event) {
    //   console.log("scroll");
    //   const scrollContainer = event.target;
    //   const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

    //   if (scrollTop + clientHeight >= scrollHeight) {
    //     this.increaseDivHeight();
    //   }
    // },
    increaseDivHeight() {
      this.divHeight += 10; // adjust the height increase as needed
    },
  },
  mounted() {
    this.columns = this.$props.dataTable;
    console.log("data", this.columns);
    // const scrollContainer = document.querySelector(".custom-div");
    // scrollContainer.addEventListener("scroll", this.handleScroll);
  },

  beforeDestroy() {
    const scrollContainer = document.querySelector(".custom-div");
    // scrollContainer.removeEventListener("scroll", this.handleScroll);
  },
  watch: {
    selectedCard(val) {
      console.log(val);
      this.selectedCardId = "";
    },
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
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
  min-width: 200px;
  /* width: 320px; */
}
@media (min-width: 1200px) {
  .Header {
    width: 300px !important;
    height: 50px !important;
  }
  .column-width {
    width: 322px !important;
  }
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
  font-family: "Helvetica Neue" !important;
}
.crad-columns {
  /* max-height: 51vh !important; */
  /* min-height: calc(100vh - 23rem) !important;
  max-height: calc(100vh - 23rem) !important;
  overflow-y: scroll; */
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
  margin-left: 0.5rem;
  /* min-height: 25rem; */

  /* max-height: 100%; */
  margin-top: 0rem;
}

.py-12 {
  padding-top: 3rem;
}

.column-width {
  width: 280px;
}

.bg-gray-100 {
  padding-bottom: 12px;
  padding-top: 2px;
  box-shadow: inset;
  /* background-color: #f7fafc; */
  min-width: 100px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.px-3 {
  padding-right: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

/* .mr-4 {
  margin-right: 1rem;
} */

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
  color: #777;
  border-radius: 4px;
  padding: 5px;
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
  max-height: 85vh;
  overflow-y: hidden;
  scrollbar-width: none;
}

.content_section {
  padding: 24px;
  min-height: calc(100vh - 100px);
}
.Header {
  width: 260px;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  padding: 0.5rem;

  align-items: center;
  align-content: center;
  margin-bottom: 1rem;
  border-radius: 4px;
  /* box-shadow: 0 0 8px 0 var(--step-150); */
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.18);
}
.create_btn {
  border: 1px dashed #777777;
  color: #777777;
  /* border-radius: 6px; */
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding: 10px 10px;
  margin-top: 1rem;
  margin-bottom: 0.2rem;
  margin: 0.2rem;
}
.create_section_btn {
  border: 1px dashed #777;
  color: #777;
  /* border-radius: 6px; */
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding: 10px 10px;
  margin-bottom: 0.3rem;
}
.card-selected {
  background-color: yellow;
}
.custom-div {
  overflow-y: scroll;
}
</style>

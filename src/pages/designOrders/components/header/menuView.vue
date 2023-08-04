<template>
  <div class="selector" id="menu">
    <div v-for="(menu, inx) in menuItems" :key="inx" class="el-menu-demo">
      <span class="icons">
        <img
          v-if="menu.icon == 'sort'"
          src="../../assets/sort.svg"
          alt="alter"
        />

        <img
          v-if="menu.icon == 'filter'"
          src="../../../leadManagement/components/assets/filter_alt.svg"
          alt="alter"
        />
      </span>
      <el-menu
        :default-active="'1'"
        mode="horizontal"
        @select="menu.callback"
        text-color="#222"
        active-text-color="#222"
        :label="menu.title"
        :value="menu.value"
      >
        <el-submenu index="1-1">
          <template slot="title">{{ menu.title }}</template>
          <div v-if="menu.singleLevel">
            <el-menu-item
              v-for="item in menu.options"
              :default-active="'order_status'"
              :key="item.value"
              :index="item.value"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
            </el-menu-item>
          </div>
          <div v-if="!menu.singleLevel">
            <el-submenu
              v-for="item in menu.options"
              :key="item.value"
              :index="item.label"
              :label="item.label"
              :value="item.value"
            >
              <template slot="title">{{ item.value }}</template>
              <template
                v-if="item.type === 'checkbox' && item.value == 'Lead Source'"
              >
                <div class="checkBoxborder">
                  <el-checkbox-group
                    class="checkBox"
                    v-model="selectedLeadCheckboxes"
                  >
                    <el-checkbox
                      v-for="subItem in item.subOptions"
                      :key="subItem.value"
                      :index="subItem.label"
                      :label="subItem.label"
                      :value="subItem.value"
                    >
                      {{ subItem.value }}
                    </el-checkbox>
                    <el-button
                      @click="updateLeadCheckbox"
                      class="updateButton"
                      :disabled="selectedLeadCheckboxes.length === 0"
                      type="primary"
                      >Update</el-button
                    >
                  </el-checkbox-group>
                </div>
              </template>
              <template v-if="item.type === 'checkbox' && item.value == 'Tags'">
                <div class="checkBoxborder">
                  <el-checkbox-group
                    class="checkBox"
                    v-model="selectedTagCheckboxes"
                  >
                    <div class="checkbox-container">
                      <el-checkbox
                        v-for="subItem in item.subOptions"
                        :key="subItem.value"
                        :index="subItem.label"
                        :label="subItem.label"
                        :value="subItem.value"
                      >
                        {{ subItem.value }}
                      </el-checkbox>
                    </div>
                    <el-button
                      @click="updateTagCheckbox"
                      class="updateButton fixed-button"
                      :disabled="selectedTagCheckboxes.length === 0"
                      type="primary"
                      >Update</el-button
                    >
                  </el-checkbox-group>
                </div>
              </template>
              <template v-else-if="item.type === 'date'">
                <div class="dateContainer">
                  <el-date-picker
                    v-model="selectedDate"
                    type="daterange"
                    range-separator="-"
                    @change="updateDate"
                    start-placeholder="From Date"
                    end-placeholder="To Date"
                  >
                  </el-date-picker>
                  <!-- <el-date-picker
                    class="datePick"
                    v-model="selectedDate"
                    type="date"
                    :picker-options="datePickerOptions"
                    placeholder="After Date"
                  >
                  </el-date-picker>
                  <el-date-picker
                    class="datePick"
                    v-model="selectedDate"
                    type="date"
                    :picker-options="datePickerOptions"
                    placeholder="Before Date"
                  >
                  </el-date-picker> -->
                  <!-- <el-button @click="updateDate" class="updateButton" :disabled="selectedDate===''" type="primary">Update</el-button> -->
                  <!-- <button class="updateButton">Update</button> -->
                </div>
              </template>
              <template v-else-if="item.type === 'dropdown'">
                <div class="countryDropContainer">
                  <el-select
                    class="countryselect"
                    v-model="selectedOption"
                    placeholder="USA"
                  >
                    <el-option
                      v-for="subItem in item.subMenu"
                      :key="subItem.value"
                      :label="subItem.label"
                      :value="subItem.value"
                    >
                    </el-option>
                  </el-select>
                  <el-select
                    class="countryselect"
                    v-model="selectedOption"
                    placeholder="California"
                  >
                    <el-option
                      v-for="subItem in item.subMenu"
                      :key="subItem.value"
                      :label="subItem.label"
                      :value="subItem.value"
                    >
                    </el-option>
                  </el-select>
                  <el-select
                    class="countryselect"
                    v-model="selectedOption"
                    placeholder="90001"
                  >
                    <el-option
                      v-for="subItem in item.subMenu"
                      :key="subItem.value"
                      :label="subItem.label"
                      :value="subItem.value"
                    >
                    </el-option>
                  </el-select>
                </div>
              </template>
              <template v-else-if="item.type === 'input'">
                <div class="inputContainer">
                  <label>
                    <input
                      class="menuInput"
                      v-model="lessValue"
                      type="text"
                      placeholder="Less Than"
                    />
                    <span class="labelText2"> kW</span>
                  </label>
                  <label>
                    <input
                      class="menuInput"
                      v-model="moreValue"
                      type="text"
                      placeholder="More Than"
                    />
                    <span class="labelText2"> kW</span>
                  </label>
                  <el-button
                    class="updateButton"
                    @click="UpdateDCvalue"
                    :disabled="lessValue === '' && moreValue === ''"
                    type="primary"
                    >Update</el-button
                  >
                </div>
              </template>
              <template v-else-if="item.type === '$input'">
                <div class="inputContainer">
                  <label>
                    <span class="labelText">$</span>
                    <input
                      class="menuInput"
                      v-model="lessCost"
                      type="text"
                      placeholder="Less Than"
                    />
                  </label>
                  <label>
                    <span class="labelText">$</span>
                    <input
                      class="menuInput"
                      v-model="moreCost"
                      type="text"
                      placeholder="More Than"
                    />
                  </label>
                  <el-button
                    @click="updateCost"
                    class="updateButton"
                    :disabled="lessCost === '' && moreCost === ''"
                    type="primary"
                    >Update</el-button
                  >
                </div>
              </template>
              <!-- <template v-else-if="!item.type">
                <el-menu-item
                  v-for="subItem in item.subOptions"
                  :key="subItem.value"
                  :index="subItem.label"
                  :label="subItem.label"
                  :value="subItem.value"
                  :multiple="true"
                >
                  {{ subItem.value }}
                </el-menu-item>
              </template> -->
              <div v-if="item.type !== 'checkbox'" class="checkbox-container">
                <el-menu-item
                  v-for="subItem in item.subOptions"
                  :key="subItem.value"
                  :index="subItem.index ? subItem.index : subItem.label"
                  :label="subItem.label"
                  :value="subItem.value"
                  :multiple="true"
                >
                  {{ subItem.value
                  }}<span
                    v-if="subItem.competence"
                    :style="{ paddingLeft: '1rem' }"
                  >
                    <el-tag
                      v-for="(comp, indx) in subItem.competence"
                      :key="indx"
                      class="tag"
                      :color="handleColorLightning(handleColor(comp), 80)"
                      :style="{
                        color: `${handleColor(comp)}`,
                        marginLeft: '0.2rem',
                      }"
                      type="red"
                      size="mini"
                    >
                      {{ comp }}
                    </el-tag>
                  </span>
                </el-menu-item>
              </div>
            </el-submenu>
          </div>
        </el-submenu>
      </el-menu>
    </div>
  </div>
</template>

<script>
import {
  getLightenedColor,
  handleCompetenceColor,
} from "../../../../utils/colorGenerator.js";

export default {
  data() {
    return {
      selectedLeadCheckboxes: [],
      selectedTagCheckboxes: [],
      datePickerOptions: {},
      selectedDate: "",
      lessValue: "",
      DCValue: [],
      cost: [],
      moreValue: "",
      date: [],
      lessCost: "",
      moreCost: "",
      selectedOption: "",
      activeBackgroundColor: "#FF0000",
      selectedSubMenuItem: "",
    };
  },
  props: {
    menuItems: {
      type: Array,
    },
    clearAll: {
      type: Boolean,
    },
  },

  mounted() {
    this.colorUL();
  },
  methods: {
    colorUL() {
      let nodeList = document.querySelectorAll(".el-submenu__title");
      for (let i = 0; i < nodeList.length; i++) {
        nodeList[i].style.color = "#222";
      }

      let arrowList = document.querySelectorAll(".el-icon-arrow-right");
      for (let i = 0; i < arrowList.length; i++) {
        arrowList[i].style.color = "#222";
        arrowList[i].style.fontSize = "16px";
        arrowList[i].style.fontWeight = "bold";
      }

      let checkboxLabel = document.querySelectorAll(".el-checkbox__label");
      for (let i = 0; i < checkboxLabel.length; i++) {
        checkboxLabel[i].style.color = "#222";
      }
    },
    handleColor(data) {
      console.log(data);
      return handleCompetenceColor(data);
    },
    handleColorLightning(color, perc) {
      return getLightenedColor(color, perc);
    },
    useImg(url) {
      return url;
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    selectSubMenuItem(value) {
      this.selectedSubMenuItem = value;
    },
    updateDate() {
      this.date = this.selectedDate;
      console.log(this.date);
      // this.show = false;
      this.$emit("ExpectedClosure", this.date);
    },
    updateLeadCheckbox() {
      this.$emit("leadCheckbox", this.selectedLeadCheckboxes);
      console.log(this.selectedLeadCheckboxes);
    },
    updateTagCheckbox() {
      this.$emit("tagCheckbox", this.selectedTagCheckboxes);
      console.log(this.selectedTagCheckboxes);
    },
    UpdateDCvalue() {
      this.DCValue = [this.lessValue, this.moreValue];
      console.log(this.DCValue);
      this.$emit("DCValue", this.DCValue);
    },
    updateCost() {
      this.cost = [this.lessCost, this.moreCost];
      this.$emit("systemCost", this.cost);
    },
  },
  watch: {
    menuItems(newval) {
      console.log(newval);
    },
    clearAll(value) {
      console.log(value);
      this.lessValue = "";
      this.moreValue = "";
      this.selectedDate = "";
      this.date = [];
      this.lessCost = "";
      this.moreCost = "";
      this.selectedTagCheckboxes = [];
      this.selectedLeadCheckboxes = [];
      this.$emit("update:clearAll", false);
    },
  },
};
</script>

<style scoped>
.img {
  max-width: none !important;
}
.selector {
  display: flex;
}
.datePick {
  padding: 5%;
}
.countryselect {
  padding: 5px 10px;
  text-align: center;
  border: none;
}
.updateButton {
  /* background-color: #1c191c2e; */
  border: none;
  color: white;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  float: right;
  margin-right: 12px;
}

.inputContainer {
  padding: 10px 10px;
}

.inputContainer label {
  display: flex;
  align-items: center;
}

.inputContainer input {
  margin-bottom: 10px;
}

.labelText {
  margin-right: 10px;
  margin-bottom: 5px;
  color: #777777;
}
.labelText2 {
  margin-left: 10px;
  margin-bottom: 5px;
  color: #777777;
}
/* .el-submenu__title {
  background-color: aqua;
} */
.el-submenu.is-active .el-submenu__title {
  border-bottom-color: transparent;
  background-color: red;
}

.el-menu--horizontal >>> .el-submenu.is-active .el-submenu__title {
  border-bottom: transparent;
  color: #222;
  height: 40px;
  line-height: 40px;
}
.el-menu--horizontal >>> .el-submenu .el-submenu__title {
  height: 40px;
  line-height: 40px;
  border-bottom: 2px solid transparent;
  color: #222 !important;
  font-size: 16px;
  width: 155px;
}
.menuInput {
  padding: 8px;
  gap: 8px;
  width: 238px;
  height: 40px;
  background: #e8edf2;
  border-radius: 4px;
  border-color: transparent;
}

.el-menu--horizontal .el-menu .el-menu-item {
  /* background-color: #FFFFFF; */
  float: none;
  height: 36px;
  line-height: 36px;
  padding: 0 10px;
  color: #222 !important;
}

.countryDropContainer {
  padding: 5px 10px;
}
.dateContainer {
  padding: 5px 10px;
  text-align: center;
  border: none;
}
.checkBox {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin: 2%;
}
.checkbox-container {
  max-height: 400px; /* Adjust the maximum height as needed */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.fixed-button {
  width: 100px;
  margin-left: auto;
}
.checkBox .el-checkbox {
  padding: 5%;
}
.el-menu {
  display: flex;
  align-items: center;
  border-radius: 4px;
}
.el-menu-demo {
  display: flex;
  margin-right: 0.5rem;
  align-items: center;
}
.icons {
  margin-right: 0.5rem;
}
.tag {
  border-radius: 20px;
}
.sort {
  width: 20px;
}

.el-menu-item.is-active {
  /* background-color: #e8edf2 !important; */
}
.el-menu-item {
  color: #222 !important;
}

.menu-container {
  height: 300px; /* Set the desired height */
  overflow-y: auto; /* Enable vertical scrollbar */
}

.selector >>> .el-submenu__icon-arrow {
  position: absolute;
  top: 50%;
  right: 20px;
  margin-top: -7px;
  transition: transform 0.3s;
  font-size: 18px;
  font-weight: bold;
}
.checkBoxborder ::v-deep .el-checkbox__inner {
  /* display: inline-block;
    position: relative; */
  border: 1px solid #222;
}
.checkBoxborder ::v-deep .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #409eff;
  border-color: #409eff !important;
}
.checkBoxborder ::v-deep.el-checkbox__input.is-checked + .el-checkbox__label {
  color: #222;
}
.checkBoxborder ::v-deep.el-checkbox__input + .el-checkbox__label {
  color: #222;
}
/* .el-menu--horizontal >>>  .el-menu .el-submenu__title {
  color: #222;
} */
</style>

<template>
  <div>
    <section :class="['right_section', isCrmUser() ? 'right_sectionCRM': '']">
      <div class="content_section">
        <div class="filter_section">
          <div class="title">Custom Tariff</div>
          <div class="starred_action">
            <div class="headerDetails">
              <div :class="['searchCont',openSearchBox == true ? 'openSearchBox': '']">
                <input
                  type="text"
                  :class="['headerDetailsSearch', openSearchBox == true ? 'openSearchBox': '']"
                  placeholder="Search based on tariff provider or rate"
                  v-model="searchTariff"
                />
                <i
                  class="el-icon-search inpIcons"
                  v-if="searchTariff == null"
                  @click="openSearchBox = !openSearchBox"
                ></i>
                <i
                  v-else
                  @click="[(searchTariff = null), (openSearchBox = !openSearchBox)]"
                  class="el-icon-close inpIcons"
                ></i>
              </div>

              <el-button
                type="primary"
                class="headerDetailsBtn"
                @click="createTariffPopup = true"
                >Create New Tariff
              </el-button>
            </div>
          </div>
        </div>
        <div>
          <CustomTariffContainer 
            :tabCounter="tabCounter"
            :searchQuery="searchQuery"
          />
        </div>
      </div>
    </section>
    <CreateTariffPopup
      :createTariffPopup="createTariffPopup"
      @close="handleClose()"
      @added="handleAdd()"
      :key="createCounter"
    />
  </div>
</template>
  
<script>
import CustomTariffContainer from "./customTariffContainer.vue";
import CreateTariffPopup from "./createTariffPopup.vue";
import debounce from "debounce";
import { isCrmUser } from "../../../utils";


export default {
  components: {
    CustomTariffContainer,
    CreateTariffPopup,
  },

  created() {
    this.querySender = debounce(this.querySender, 1000);
  },

  watch:{
    searchTariff:{
      handler(val){
        this.querySender();
      }
    }
  },


  methods: {
    isCrmUser,
    querySender() {
      this.searchQuery = this.searchTariff; 
    },

    handleAdd(){
      this.createCounter++;
      this.tabCounter++;
      this.createTariffPopup = false;
    },
    handleClose(){
      this.createCounter++;
      this.createTariffPopup = false;
    }
  },

  props: {
    theme: {
      type: String,
      default: "lightDrowpdownWithFilters",
    },
  },
  data() {
    return {
      tabCounter: 0,
      searchTariff: null,
      searchQuery: null,
      createTariffPopup: false,
      openSearchBox: false,
      createCounter: 0,
    };
  },
};
</script>
  
  <style scoped>
.infiniteScrollLoader {
  font-size: 20px;
}
.favorite_section {
  border: none !important;
}

.main-controller .right_section {
  background: var(--step-50);
}

.title {
  font-size: 28px !important;
  font-weight: 500px !important;
}

.headerDetails {
  display: flex;
  align-items: center;
  gap: 16px;
}

.headerDetailsSearch {
  height: 48px;
  width: 336px;
  border: 1px solid #999;
  padding: 0px 16px;
  border-radius: 4px;
}

.headerDetailsBtn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.searchCont {
  position: relative;
}

.inpIcons {
  position: absolute;
  top: 16px;
  right: 8px;
  cursor: pointer;
}

.content_section .filter_section {
  gap: 6px;
  flex-wrap: nowrap;
  position: relative;
}

@media (min-width: 1281px) {
  .main-controller .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }

  .right_sectionCRM {
    width: calc(100% - 74px) !important;
  }
}

@media (max-width: 760px) {
  .content_section .title {
    font-size: 18px !important;
  }

  .headerDetailsSearch {
    height: 40px;
    width: 20px;
  }

  .openSearchBox {
    width: 100%;
  }

  .content_section .filter_section {
    padding-right: 40px;
  }

  .headerDetails {
    flex-direction: row-reverse;
  }

  .searchCont {
    position: absolute;
    top: 0px;
    right: 0px;
  }

  .headerDetailsBtn {
    font-size: 14px;
    height: 40px;
  }

  .inpIcons {
    top: 14px;
  }
}
</style>
  
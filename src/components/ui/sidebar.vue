<template>
  <main class="main-controller" :class="{ expended: isSidebarVisible }">
    <div
      :class="['backdrop', isCrmUser() ? 'backdropCRM' : '']"
      @click="toggleSidebarStatus"
    ></div>
    <aside class="aside_setion" :class="isCrmUser() ? 'aside_setionCRM' : ''">
      <nav class="navbar" :class="navbarClassFunc()">
        <ul class="nav_list" v-if="!isDynamicSidebar">
          <el-tooltip
            class="item"
            effect="dark"
            content="Dashboard"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
            <li
              :class="{
                activeProject:
                  $router.currentRoute.path === '/' && active === false,
              }"
              @click="toggleSidebarStatus"
            >
              <router-link :to="{ name: 'home' }">
                <div class="nav_icon">
                  <span class="icon" v-if="$router.currentRoute.path === '/'"
                    ><img src="../../assets/drop/Group 292.svg"
                  /></span>
                  <span class="icon" v-else
                    ><img src="../../assets/drop/Group 1938.svg"
                  /></span>
                </div>
                <span
                  class="nav_text"
                  :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
                  >Dashboard</span
                >
              </router-link>
            </li>
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Tasks"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
          <li
            v-if="isSL360User && !isESOrg"
            :class="{
              activeProject:
                $router.currentRoute.path === '/tasks' && active === false,
            }"
            @click="toggleSidebarStatus"
          >
            <a :href="SL360_URL + 'activity'">
              <div class="nav_icon">
                <span class="icon" v-if="$router.currentRoute.path === '/tasks'"
                  ><img src="../../assets/drop/Group 1937.svg"
                /></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 1896.svg"
                /></span>
              </div>
              <span class="nav_text" :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''">Tasks</span>
            </a>
          </li>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="Leads"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
            <li
              v-if="isCrmUser()"
              :class="{
                activeProject:
                  $router.currentRoute.path === '/leadmanagement' &&
                  active === false,
              }"
              @click="toggleSidebarStatus"
            >
              <router-link :to="{ name: 'leadManagement' }">
                <div class="nav_icon">
                  <span
                    class="icon"
                    v-if="$router.currentRoute.path === '/leadManagement'"
                    ><img src="../../assets/drop/Group 1939.svg"
                  /></span>
                  <span class="icon" v-else
                    ><img src="../../assets/drop/leadManagementIcon.svg"
                  /></span>
                </div>
                <span
                  class="nav_text"
                  :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
                  >Leads</span
                >
              </router-link>
            </li>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="Orders"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
            <li
              v-if="!isESOrg"
              :class="{
                activeProject:
                  $router.currentRoute.path === '/orders' && active === false,
              }"
              @click="toggleSidebarStatus"
            >
              <router-link :to="{ name: 'orders' }">
                <div class="nav_icon">
                  <span
                    class="icon"
                    v-if="$router.currentRoute.path === '/orders'"
                    ><img src="../../assets/drop/Group 1653.svg"
                  /></span>
                  <span class="icon" v-else
                    ><img src="../../assets/drop/Group 1794.svg"
                  /></span>
                </div>
                <span
                  class="nav_text"
                  :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
                  >Orders</span
                >
              </router-link>
            </li>
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="Design Orders"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
          <li
            v-if="isESOrg"
            :class="{
              activeProject:
                $router.currentRoute.path === '/designOrders' &&
                active === false,
            }"
            @click="toggleSidebarStatus"
          >
            <router-link :to="{ name: 'designOrders' }">
              <div class="nav_icon">
                <span
                  class="icon"
                  v-if="$router.currentRoute.path === '/designOrders'"
                  ><img src="../../assets/drop/Group 1653.svg"
                /></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 1794.svg"
                /></span>
              </div>
              <span
                class="nav_text"
                :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
                >Design Orders</span
              >
            </router-link>
          </li>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="Shift Management"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
          <li
            v-if="isESOrg && isESOrgAdmin"
            :class="{
              activeProject:
                $router.currentRoute.path === '/esUsers' && active === false,
            }"
            @click="toggleSidebarStatus"
          >
            <router-link :to="{ name: 'esUsers' }">
              <div class="nav_icon">
                <span
                  class="icon"
                  v-if="$router.currentRoute.path === '/esUsers'"
                  ><img src="../../assets/drop/Group 1653.svg"
                /></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 1794.svg"
                /></span>
              </div>
              <span
                class="nav_text"
                :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
                >Shift Management</span
              >
            </router-link>
          </li>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            :content="projectText+'s'"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
          <li
            v-if="!isCrmUser() && !isESOrg"
            :class="{
              activeProject:
                $router.currentRoute.path === '/projects' && active === false,
            }"
            @click="toggleSidebarStatus"
          >
            <router-link :to="{ name: 'projectListViewHome' }">
              <div class="nav_icon">
                <span
                  class="icon project"
                  v-if="$router.currentRoute.path === '/projects'"
                ></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 1654.svg"
                /></span>
              </div>
              <span class="nav_text" :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''">{{ projectText }}s</span>
            </router-link>
          </li>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="Project Management"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
          <li
            v-if="isSL360User && !isESOrg"
            :class="{
              activeProject:
                $router.currentRoute.path === '/projectManagement' &&
                active === false,
            }"
            @click="toggleSidebarStatus"
          >
            <a :href="SL360_URL + 'projects'">
              <div class="nav_icon">
                <span
                  class="icon"
                  v-if="$router.currentRoute.path === '/projectManagement'"
                  ><img src="../../assets/drop/Group 1935.svg"
                /></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 1796.svg"
                /></span>
              </div>
              <span class="nav_text" :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''">Project Management</span>
            </a>
          </li>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="Role Management"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
          <li
            v-if="isSL360User && !isESOrg"
            :class="{
              activeProject:
                $router.currentRoute.path === '/roleManagement' &&
                active === false,
            }"
            @click="toggleSidebarStatus"
          >
            <a :href="SL360_URL + 'org/roles'">
              <div class="nav_icon">
                <span
                  class="icon"
                  v-if="$router.currentRoute.path === '/roleManagement'"
                  ><img src="../../assets/drop/Group 1940.svg"
                /></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 1871.svg"
                /></span>
              </div>
              <span class="nav_text" :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''">Role Management</span>
            </a>
          </li>
          </el-tooltip>

          <li
            class="sub_list"
            :class="{ active }"
            id="sublistOne"
            @click="toggleClass()"
          >
            <a href="#">
              <div class="nav_icon">
                <span class="icon" v-if="active"
                  ><img src="../../assets/drop/unnamed.png"
                /></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 1874.svg"
                /></span>
              </div>
              <span
                class="nav_text"
                :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
                >Organization Settings</span
              >
            </a>
            <ul
              :class="isCrmUser() && !isSidebarVisible ? 'ulOrgCRM' : 'sub_nav'"
              v-if="active"
            >
              <li
                v-if="isAdmin"
                :class="{
                  activeProject:
                    $router.currentRoute.path === '/organisationSummary',
                }"
                @click="toggleSidebarStatus"
              >
                <router-link
                  v-if="isAdmin"
                  :to="{ name: 'organisationSummary' }"
                  :class="{
                    activeProject:
                      $router.currentRoute.path === '/organisationSummary',
                  }"
                >
                  - Organization Profile
                </router-link>
              </li>
              <li
                v-if="isAdmin && !isVipPowerGazebo"
                :class="{
                  activeProject: $router.currentRoute.path === '/admin',
                }"
                @click="toggleSidebarStatus"
              >
                <router-link
                  v-if="isAdmin"
                  :to="{ name: 'admin' }"
                  :class="{
                    activeProject: $router.currentRoute.path === '/admin',
                  }"
                >
                  - Manage Component
                </router-link>
              </li>
              <li
                v-if="isAdmin"
                :class="{
                  activeProject:
                    $router.currentRoute.path === '/organisationDefaults',
                }"
                @click="toggleSidebarStatus"
              >
                <router-link
                  v-if="isAdmin"
                  :to="{ name: 'organisationDefaults' }"
                  :class="{
                    activeProject:
                      $router.currentRoute.path === '/organisationDefaults',
                  }"
                >
                  - Design Defaults
                </router-link>
              </li>
              <li
                :class="{
                  activeProject: $router.currentRoute.path === '/customTariff',
                }"
                @click="toggleSidebarStatus"
              >
                <router-link
                  :to="{ name: 'customTariff' }"
                  :class="[
                    'tariffClass',
                    {
                      activeProject:
                        $router.currentRoute.path === '/customTariff',
                    },
                  ]"
                >
                  - Tariff Rate
                  <el-tooltip
                    placement="right"
                    popper-class="designStudioToolTip"
                  >
                    <template #content
                      >Create your own Tariff rate based on Time of Use.
                    </template>
                    <div>
                      <span class="crumbNew">New</span>
                    </div>
                  </el-tooltip>
                </router-link>
              </li>
              <li
                :class="{
                  activeProject:
                    $router.currentRoute.path === '/addersAndDiscounts',
                }"
                @click="toggleSidebarStatus"
              >
                <router-link
                  :to="{ name: 'addersAndDiscounts' }"
                  :class="{
                    activeProject:
                      $router.currentRoute.path === '/addersAndDiscounts',
                  }"
                >
                  - Adders and Discounts
                </router-link>
              </li>

              <li
                :class="{
                  activeProject: $router.currentRoute.path === '/incentives',
                }"
                @click="toggleSidebarStatus"
              >
                <router-link
                  :to="{ name: 'incentives' }"
                  :class="{
                    activeProject: $router.currentRoute.path === '/incentives',
                  }"
                >
                  - Manage Incentives
                </router-link>
              </li>
              <li
                :class="{
                  activeProject: $router.currentRoute.path === '/financials',
                }"
                @click="toggleSidebarStatus"
              >
                <router-link
                  :to="{ name: 'financials' }"
                  :class="{
                    activeProject: $router.currentRoute.path === '/financials',
                  }"
                >
                  - Manage Financials
                </router-link>
              </li>
              <li
                :class="{
                  activeProject: $router.currentRoute.path === '/credits',
                }"
                @click="toggleSidebarStatus"
              >
                <router-link
                  :to="{ name: 'credits' }"
                  :class="{
                    activeProject: $router.currentRoute.path === '/credits',
                  }"
                >
                  - Credits
                </router-link>
              </li>
              <li
                v-if="isSL360User && !isESOrg"
                :class="{
                  activeProject: $router.currentRoute.path === '/financials',
                }"
                @click="toggleSidebarStatus"
              >
                <a :href="SL360_URL + 'orgStages'"> - Org Stages </a>
              </li>
              <!-- <li>
                          <router-link 
                            :to="{name: 'wireSizeCalculator'}" 
                            v-show="hasAccess"
                            :class="{activeProject: $router.currentRoute.path=== '/wireSizeCalculator'}"
                            class="disabled-for-now"
                          >
                            - Wire Size Calculator
                          </router-link>
                        </li> -->
            </ul>
          </li>
          <!-- <li v-if="isAdmin" @click="toggleSidebarStatus">
            <router-link
              :to="{ name: 'inventory' }"
              :class="{
                activeProject: $router.currentRoute.path === '/inventory',
              }"
            >
              <div class="nav_icon">
                <span class="icon favorite"></span>
              </div>
              <span>My Favorites</span>
            </router-link>
          </li> -->
          <li
            class="sub_list"
            :class="{ active: activeHelpOptions }"
            id="sublist"
            @click="(activeHelpOptions = !activeHelpOptions), (active = false)"
          >
            <a href="#">
              <div class="nav_icon">
                <span class="icon help" v-if="activeHelpOptions"></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 289.svg"
                /></span>
              </div>
              <span
                class="nav_text"
                :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
                >Help</span
              >
            </a>
            <ul
              :class="isCrmUser() && !isSidebarVisible ? 'ulOrgCRM' : 'sub_nav'"
              v-if="activeHelpOptions"
            >
              <li @click="toggleSidebarStatus">
                <a href="http://help.thesolarlabs.com/" target="_blank">
                  - Help Docs
                </a>
              </li>
              <li @click="toggleSidebarStatus">
                <a @click="shortcutsDialogVisible = !shortcutsDialogVisible">
                  - Shortcuts
                </a>
              </li>
              <li
                @click="
                  toggleSidebarStatus();
                  toggleChatIcon();
                "
              >
                <a href="javascript:void(0)">
                  - {{ chatIconStatus }} Chat Icon
                </a>
              </li>
            </ul>
          </li>

          <el-tooltip
            class="item"
            effect="dark"
            content="Support Tickets"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
          <li
            v-if="isSL360User && !isESOrg"
            :class="{
              activeProject:
                $router.currentRoute.path === '/supportTicket' &&
                active === false,
            }"
            @click="toggleSidebarStatus"
          >
            <a :href="SL360_URL + 'supportTicket'">
              <div class="nav_icon">
                <span
                  class="icon"
                  v-if="$router.currentRoute.path === '/supportTicket'"
                  ><img src="../../assets/drop/Group 1933.svg"
                /></span>
                <span class="icon" v-else
                  ><img src="../../assets/drop/Group 1544.svg"
                /></span>
              </div>
              <span class="nav_text" :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''">Support Tickets</span>
            </a>
          </li>
          </el-tooltip>

          <el-tooltip
            class="item"
            effect="dark"
            content="Logout"
            placement="right"
            :disabled="!isCrmUser() || isSidebarVisible"
          >
            <li
              @click="
                logoutUser();
                toggleSidebarStatus();
              "
            >
              <a>
                <div class="nav_icon">
                  <img
                    class="Group-1544"
                    src="../../assets/iconFonts/leftSideBar/Group-1544@3x.png"
                    alt=""
                  />
                  <!-- <span class="icon help"></span> -->
                </div>
                <span
                  class="nav_text"
                  :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
                  >Logout</span
                >
              </a>
            </li>
          </el-tooltip>
        </ul>

        <!-- Dynamic sidebar menu for SL360 users -->
        <ul class="nav_list" v-else>
          <span v-for="(item, ind) in adpItems" :key="ind">
            <li
              v-if="!item.children"
              @click="toggleSidebarStatus"
              :class="{
                activeProject:
                  item.system == 'tsl' &&
                  $router.currentRoute.path === item.path &&
                  active === false,
              }"
            >
              <a
                v-if="item.system == 'sl360'"
                :href="item.base_path + item.path"
              >
                <div class="nav_icon">
                  <span class="icon"
                    ><img
                      :src="`${sidebarS3ParentLink}${
                        iconMappingDict[item.icon_name]
                      }_gray.svg`"
                  /></span>
                </div>
                <span class="nav_text">{{ item.label }}</span>
              </a>
              <router-link v-else :to="item.path">
                <div class="nav_icon">
                  <span class="icon">
                    <img
                      :src="
                        item.system == 'tsl' &&
                        $router.currentRoute.path === item.path
                          ? `${sidebarS3ParentLink}${
                              iconMappingDict[item.icon_name]
                            }_blue.svg`
                          : `${sidebarS3ParentLink}${
                              iconMappingDict[item.icon_name]
                            }_gray.svg`
                      "
                    />
                  </span>
                </div>
                <span class="nav_text">{{ item.label }}</span>
              </router-link>
            </li>
            <li
              v-else
              class="sub_list"
              :class="item.isActive ? 'active' : ''"
              @click="item.isActive = !item.isActive"
            >
              <a href="#">
                <div class="nav_icon">
                  <span class="icon">
                    <img
                      :src="
                        active
                          ? `${sidebarS3ParentLink}${
                              iconMappingDict[item.icon_name]
                            }_blue.svg`
                          : `${sidebarS3ParentLink}${
                              iconMappingDict[item.icon_name]
                            }_gray.svg`
                      "
                    />
                  </span>
                </div>
                <span>{{ item.label }}</span>
              </a>
              <ul class="sub_nav">
                <li
                  v-for="(child, ind) in item.children"
                  :key="ind"
                  @click="toggleSidebarStatus"
                >
                  <a
                    v-if="child.system == 'sl360'"
                    :href="child.base_path + child.path"
                  >
                    <span class="nav_text">{{ child.label }}</span>
                  </a>
                  <router-link v-else :to="child.path">
                    <span class="nav_text">{{ child.label }}</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </span>
          <li
            @click="
              logoutUser();
              toggleSidebarStatus();
            "
          >
            <a>
              <div class="nav_icon">
                <img
                  class="Group-1544"
                  :src="`${sidebarS3ParentLink}${iconMappingDict['LogoutIcon']}_gray.svg`"
                  alt=""
                />
              </div>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </nav>

      <div
        @click="
          goToUserProfile();
          toggleSidebarStatus();
        "
        class="profile_details"
      >
        <span class="profile_icon">
          <img
            src="../../assets/iconFonts/leftSideBar/dummy-profile.svg"
            alt="Profile"
          />
        </span>
        <div
          class="pro_text"
          :class="!isSidebarVisible && isCrmUser() ? 'hideLabel' : ''"
        >
          <h5>{{ userName }}</h5>
          <h6>{{ userEmail }}</h6>
        </div>
      </div>
    </aside>
    <el-dialog
      :visible.sync="shortcutsDialogVisible"
      append-to-body
      :close-on-click-modal="false"
      title="Shortcuts"
      width="30%"
      height="66%"
    >
      <div class="data-summary">
        <p v-if="isVipPowerGazebo">
          Gazebo
          <span class="output"> G </span>
        </p>
        <p>
          Flat Roof
          <span class="output"> P </span>
        </p>
        <p>
          Pitched Roof
          <span class="output"> R </span>
        </p>
        <p>
          Draw Face
          <span class="output"> Shift + F </span>
        </p>
        <p>
          Polygon Obstruction
          <span class="output"> Shift + P </span>
        </p>
        <p>
          Rectangle Obstruction
          <span class="output"> Shift + R </span>
        </p>
        <p>
          Cylinder Obstruction
          <span class="output"> C </span>
        </p>
        <p>
          Walkway
          <span class="output"> W </span>
        </p>
        <p>
          Safety Line
          <span class="output"> E </span>
        </p>
        <p>
          Handrail
          <span class="output"> H </span>
        </p>
        <p>
          Property Line
          <span class="output"> N </span>
        </p>
        <p>
          Tree
          <span class="output"> T </span>
        </p>
        <p>
          Dimension Tool
          <span class="output"> D </span>
        </p>
        <p>
          Lasso Tool
          <span class="output"> L </span>
        </p>
        <p v-if="!isVipPowerGazebo">
          Subarray
          <span class="output"> S </span>
        </p>
        <p v-if="isUSFlagEnabled && !isVipPowerGazebo">
          Gazebo
          <span class="output"> G </span>
        </p>
        <p>
          Text Box
          <span class="output"> B </span>
        </p>
        <p v-if="!isVipPowerGazebo">
          Fill face the selected Model
          <span class="output"> F </span>
        </p>
        <p v-if="!isVipPowerGazebo">
          Optimize the selected Subarray
          <span class="output"> O </span>
        </p>
        <p v-if="!isVipPowerGazebo">
          Inverter Menu
          <span class="output"> I </span>
        </p>
        <p>
          Mirror Image
          <span class="output"> M </span>
        </p>
        <p>
          Cancel drawing/placing
          <span class="output"> Esc </span>
        </p>
        <p>
          Discard properties changes
          <span class="output"> Esc </span>
        </p>
        <p>
          Complete drawing/placing
          <span class="output"> Enter </span>
        </p>
        <p>
          Accept change
          <span class="output"> Enter </span>
        </p>
        <p>
          Delete selected object
          <span class="output"> Del </span>
        </p>
        <p>
          Undo
          <span class="output"> Ctrl / Cmd + Z </span>
        </p>
        <p>
          Redo
          <span class="output"> Ctrl / Cmd + Shift + Z </span>
        </p>
        <p>
          Save
          <span class="output"> Ctrl / Cmd + S </span>
        </p>
        <p>
          Quick Look
          <span class="output"> Q </span>
        </p>
        <p>
          X-Ray mode
          <span class="output"> Press and Hold 'X' </span>
        </p>
        <p>
          Zoom In
          <span class="output"> Ctrl / Cmd + Alt + Plus(+) </span>
        </p>
        <p>
          Zoom Out
          <span class="output"> Ctrl / Cmd + Alt + Minus(-) </span>
        </p>
        <p>
          Default Zoom
          <span class="output"> Ctrl / Cmd + Alt + Zero(0) </span>
        </p>
        <p>
          2D mode
          <span class="output"> Double Press '2' </span>
        </p>
        <p>
          3D mode
          <span class="output"> Double Press '3' </span>
        </p>
        <p>
          SLD mode
          <span class="output"> Double Press '4' </span>
        </p>
        <p v-if="!isVipPowerGazebo">
          Add Table Mode
          <span class="output"> A </span>
        </p>
        <p v-if="!isVipPowerGazebo">
          Delete Table Mode
          <span class="output"> Shift + D </span>
        </p>
      </div>
    </el-dialog>
  </main>
</template>

<script>
import API from "@/services/api/";
import { SL360_URL, es_org_id } from "../../constants";
import { mapActions } from "pinia";
import { useAuthStore } from "../../stores/auth";
import { useRootStore } from "../../stores/root";
import { isCrmUser } from "../../utils";

function listnerForToggle(e) {
  if (
    document.getElementsByClassName("humburger")[0]?.contains(e.target) ||
    document.getElementsByClassName("humburgerCRM")[0]?.contains(e.target) ||
    document.getElementsByClassName("aside_setion")[0]?.contains(e.target) ||
    document.getElementsByClassName("aside_setionCRM")[0]?.contains(e.target)
  ) {
  } else {
    if (this.isSidebarVisible) {
      useRootStore().toggleSidebar();
    }
  }
}

export default {
  data() {
    return {
      country: null,
      active: false,
      hasAccess: true,
      activeProject: false,
      userEmail: "",
      userName: "",
      activeHelpOptions: false,
      shortcutsDialogVisible: false,
      chatIconStatus: "Hide",
      SL360_URL,
      isDynamicSidebar: false,
      adpItems: [],
      isVipPowerGazebo: false,
      // If you want to add more icons, you can ask someone who has AWS credentials
      // to add the new icons to the S3 bucket
      sidebarS3ParentLink:
        "https://design-studio-app-icons.s3.ap-south-1.amazonaws.com/sidebar-icons/",
      iconMappingDict: {
        tsl_dashboard_icon: "dashboard",
        sl360_dashboard_icon: "dashboard",
        tasks_icon: "tasks",
        sl360_expert_service_orders_icon: "orders",
        tsl_orders_icon: "orders",
        OrdersIcon: "orders",
        design_project_icon: "designs",
        project_management_icon: "project_management",
        product_orders_icon: "product_orders",
        lead_management_icon: "lead_management",
        role_management_icon: "role_management",
        org_settings_icon: "organisation_settings",
        help_icon: "help_docs",
        support_ticket_icon: "support_tickets",
        LogoutIcon: "logout",
        inverter_icon: "device_information",
        device_management_icon: "devices",
        firmwares_icon: "firmwares",
        user_management_icon: "user_management",
        org_overview_icon: "organisation_overview",
        system_alert_icon: "alert",
        image_gallery_icon: "image_gallery",
        products_icon: "products",
      },
    };
  },
  created() {
    this.defineOrganisationSettings();
    // this.fetchSidebarItems()
    // this.displayUserInformation();
  },
  async mounted() {
    this.isVipPowerGazebo = await this.setGazeboStatus();
    this.fetchUserProfile();

    let exceptClasses = [".humburgerCRM", ".aside_setionCRM"];

    let vm = this;
    window.addEventListener("click", listnerForToggle.bind(vm));

    window.addEventListener(
      "click",
      function (e) {
        let toggle = document.getElementById("sublistOne");
        if (!toggle) {
          return;
        }

        if (toggle?.contains(e.target)) {
        } else {
          this.active = false;
        }
      }.bind(vm)
    );
    this.navbarClassFunc();
  },

  destroyed() {
    let vm = this;
    window.removeEventListener("click", listnerForToggle.bind(vm));
  },

  computed: {
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      if (user.role == "ADMIN") {
        return true;
      }
      return false;
    },

    isESOrg() {
      const org = JSON.parse(localStorage.getItem("organisation")) || {};
      if (org.id === es_org_id) {
        return true;
      }
      return false;
    },

    isESOrgAdmin() {
      const org = JSON.parse(localStorage.getItem("organisation")) || {};
      const user = JSON.parse(localStorage.getItem("user")) || {};

      if (org.id === es_org_id && user.role === "ADMIN") {
        return true;
      }
      return false;
    },
    isUSFlagEnabled() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.isUSFlagEnabled;
    },
    isSL360User() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      return user.is_sl_360_user;
    },
    isSidebarVisible() {
      return useRootStore().sidebarStatus;
    },
    projectText() {
      if (this.isSL360User) {
        return "Design";
      } else {
        return "Project";
      }
    },
  },
  methods: {
    ...mapActions(useAuthStore, ["LOGOUT"]),
    navbarClassFunc() {
      if (isCrmUser()) {
        if (this.isSidebarVisible) {
          return "navbarOverflow";
        } else {
          return;
        }
      } else {
        return "navbarOverflow";
      }
    },
    goToUserProfile() {
      this.$router.push({ name: "profile" });
    },
    async setGazeboStatus() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      let organisationId = user.organisation_id;
      let responseData = JSON.parse(localStorage.getItem("organisation")) || {};
      if (
        !(
          Object.keys(responseData).length &&
          responseData.hasOwnProperty("vip_for_power_gazebo")
        )
      ) {
        responseData = (
          await API.ORGANISATION.FETCH_ORGANISATION(organisationId)
        ).data;
      }
      return Promise.resolve(responseData.vip_for_power_gazebo);
    },
    async fetchUserProfile() {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const token = user.token;
      const user_id = user.user_id;
      this.country = user.country;
      if (token) {
        try {
          // const response = await API.USERS.FETCH_USER(user_id);
          // const resultUserProfile = response.data;
          let resultUserProfile = user;
          if (!Object.keys(resultUserProfile).length) {
            const response = await API.USERS.FETCH_USER(user_id);
            resultUserProfile = response.data;
          }
          this.userName =
            resultUserProfile.first_name + " " + resultUserProfile.last_name;
          this.userEmail = resultUserProfile.email;

          if (this.userName.length > 18) {
            this.userName = this.userName.substring(0, 17) + "...";
          }
          if (this.userEmail.length > 26) {
            this.userEmail = this.userEmail.substring(0, 25) + "...";
          }
        } catch (e) {}
      }
    },
    toggleSidebarStatus() {
      if (this.isCrmUser()) {
        return null;
      } else {
        useRootStore().toggleSidebar();
      }
    },
    defineOrganisationSettings() {
      if (this.$router.currentRoute.path === "/") {
        this.active = false;
      }
      if (
        this.$router.currentRoute.path === "/organisationSummary" ||
        this.$router.currentRoute.path === "/admin" ||
        this.$router.currentRoute.path === "/organisationDefaults" ||
        this.$router.currentRoute.path === "/incentives" ||
        this.$router.currentRoute.path === "/financials" ||
        this.$router.currentRoute.path === "/customTariff"
      ) {
        if (!this.isCrmUser()) this.active = true;
      }
    },

    toggleClass() {
      if (this.$router.currentRoute.path === "/") {
        this.active = !this.active;
        this.activeHelpOptions = false;
        this.activeProject = !this.activeProject;
      } else {
        this.activeHelpOptions = false;
        this.active = !this.active;
      }
      // this.activeProject = !this.activeProject;
    },
    toggleChatIcon() {
      let chatIconVisibility = document.getElementsByClassName(
        "intercom-lightweight-app"
      )[0];
      if (this.chatIconStatus === "Hide") {
        this.chatIconStatus = "Show";
        chatIconVisibility.style.display = "none";
      } else {
        this.chatIconStatus = "Hide";
        chatIconVisibility.style.display = "block";
      }
    },
    async logoutUser() {
      try {
        await this.LOGOUT();
        this.$router.push({ name: "login" });
      } catch (e) {
        console.error(e);
      }
    },
    // #ArkaLoginFlow
    async fetchSidebarItems() {
      if (!this.isSL360User) {
        return;
      }

      let itemList = localStorage.getItem("sidebar_items");
      if (!itemList) {
        let respData;
        try {
          let user = JSON.parse(localStorage.getItem("user")) || {};
          let userId = user.user_id;
          let userResp = await API.USERS.FETCH_USER(userId);
          if (!userResp.data.role_id) {
            return;
          }

          let resp = await API.ARKA.FETCH_SIDEBAR_ITEMS(userResp.data.role_id);
          respData = await resp.json();
          if (!resp.ok) {
            throw new Error(respData.message);
          }
        } catch (err) {
          console.error(err);
          return;
        }
        itemList = respData.message;
        localStorage.setItem("sidebar_items", JSON.stringify(itemList));
      } else {
        try {
          itemList = JSON.parse(itemList);
          if (typeof itemList != "object") {
            throw "Not a JSON";
          }
        } catch (e) {
          console.error(e);
          localStorage.removeItem("sidebar_items");
          // this.fetchSidebarItems()
          return;
        }
      }

      itemList.forEach((item) => {
        if (item.children) {
          item.isActive = false;
        }
      });
      let newList = this.adpItems.concat(itemList);
      this.adpItems = newList;
      this.isDynamicSidebar = true;

      console.log(this.adpItems);
    },
    isCrmUser,
  },
};
</script>
<style type="text/css" scoped>
@import url(../../assets/ico-font/ico-font.css);

.crumbNew {
  font-size: 14px;
  color: #ffff;
  background-color: rgb(239, 161, 72);
  padding: 3px 5px 3px 5px;
  border-radius: 2px;
}

.tariffClass {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
}
* {
  box-sizing: border-box;
  margin: 0;
  font-family: var(--font);
}
a {
  cursor: pointer;
  text-decoration: none;
}
a:focus {
  outline: none;
  background-color: transparent;
}
a:active,
a:hover {
  outline: 0;
}
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
main,
menu,
nav,
section,
summary {
  display: block;
}
ul {
  padding: 0;
  list-style: none;
}
.aside_setion {
  width: 260px;
  height: 100%;
  left: 0;
  top: 100px;
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 431;
  background: var(--white);
  margin-top: 1px;
}

.aside_setionCRM {
  width: 74px;
  transition: all ease-in-out 0.4s;
  top: 100px;
}

.main-controller.expended .aside_setionCRM {
  width: 260px;
  box-shadow: 0 40px 40px 0 var(--medium);
}

@media (max-width: 1280px) {
  .aside_setion {
    top: 100px;
  }
}

@media (max-width: 1280px) {
  .aside_setion {
    transform: translateX(-100%);
    transition: all ease-in-out 0.4s;
    top: 100px;
  }
}

.main-controller.expended .backdropCRM {
  opacity: 1;
  visibility: visible;
  z-index: 21;
}

@media (max-width: 1280px) {
  .main-controller.expended .backdrop {
    opacity: 1;
    visibility: visible;
    z-index: 21;
  }
  .main-controller.expended .aside_setion {
    transform: translateX(0);
    box-shadow: 0 40px 40px 0 var(--medium);
  }
}
.main-controller .right_section {
  background: var(--step-50);
}
@media (min-width: 1281px) {
  .main-controller .right_section {
    width: calc(100% - 260px);
    margin-left: auto;
  }
}
.main-controller .backdrop {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: all ease-in-out 0.35s;
  visibility: hidden;
  z-index: -21;
}
.navbar {
  flex-grow: 1;
  max-height: calc(100vh - 185px);
  -ms-overflow-style: none;
  scrollbar-width: none;
  overflow: inherit;
}

.navbarOverflow {
  overflow-y: scroll !important;
}
.navbar::-webkit-scrollbar {
  width: 0 !important;
}
@media (max-width: 767px) {
  .navbar {
    max-height: calc(100vh - 162px);
  }

  .aside_setion {
    top: 79px;
  }
}
.navbar .nav_list {
  height: 100%;
  border-right: 1px solid var(--step-100);
}
.navbar .nav_list li {
  position: relative;
  border-bottom: 1px solid var(--step-100);
}
.navbar .nav_list li:before {
  content: "";
  position: absolute;
  width: 0;
  height: 100%;
  left: 0;
  background: var(--step-50);
  transition: all ease-in-out 0.4s;
  display: block;
  top: 0;
  z-index: 0;
}
.navbar .nav_list li > a {
  display: flex;
  width: 100%;
  padding: 16px 24px;
  position: relative;
  z-index: 1;
  font-size: var(--f16);
  color: var(--step-250);
  font-weight: normal;
  align-items: center;
}
.navbar .nav_list li > a .nav_icon {
  min-width: 24px;
  max-width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: inherit;
}
.navbar .nav_list li > a .nav_icon span {
  font-size: 22px;
  color: inherit;
}
.nav_text {
  font: inherit;
  transition: all ease-in-out 0.4s;
  animation: fadeIn 1s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.navbar .nav_list li:hover:before,
.navbar .nav_list li.active:before {
  width: calc(100% + 1px);
}
.navbar .nav_list li:hover a,
.navbar .nav_list li.active a {
  color: var(--primary);
}
.navbar .nav_list li.activeProject a {
  color: var(--primary);
}
.navbar .nav_list li.activeProject {
  background-color: #e8edf2;
  width: calc(100% + 1px);
}

.navbar .nav_list li.active a {
  font-weight: 500;
}

.sub_list {
  position: relative;
}

.ulOrgCRM {
  position: absolute;
  top: 0px;
  left: 74px;
  background-color: #fff;
  width: 240px;
  border: 1px solid #ccc;
}

.navbar .nav_list li.sub_list:before:hover {
  width: calc(100% + 0px);
}
.navbar .nav_list li.sub_list > a {
  position: relative;
  transition: all ease-in-out 0.3s;
}
.navbar .nav_list li.sub_list > a:after {
  content: "";
  width: 7px;
  height: 7px;
  border-right: 2px solid var(--primary);
  border-bottom: 2px solid var(--primary);
  transform: rotate(-45deg);
  position: absolute;
  right: 14px;
  top: calc(50% - 5px);
  transition: all ease-in-out 0.3s;
}
.navbar .nav_list li.sub_list .sub_nav {
  padding-left: 65px;
  position: relative;
  z-index: 1;
  opacity: 0;
  visibility: hidden;
  transform: scaleY(0);
  transform-origin: top center;
  transition: all ease-in-out 0.2s;
  max-height: 0;
}
.navbar .nav_list li.sub_list .sub_nav li {
  border-top: 1px solid var(--step-100);
  border-bottom: 0;
}
.navbar .nav_list li.sub_list .sub_nav li a {
  padding: 16px 24px 16px 0;
  position: relative;
  z-index: 1;
  font-size: var(--f16);
  color: var(--step-250);
  font-weight: normal;
  display: block;
}
.navbar .nav_list li.sub_list .sub_nav li:hover:before,
.navbar .nav_list li.sub_list .sub_nav li.active:before {
  width: calc(100% + 1px);
}

.navbar .nav_list .sub_list .sub_nav li:hover a {
  color: var(--primary);
}

.navbar .nav_list .sub_list .sub_nav a.activeProject {
  color: var(--primary);
}

.navbar .nav_list .sub_list .sub_nav li.activeProject {
  width: calc(100% + 1px);
}

.navbar .nav_list li.sub_list.active:before {
  width: calc(100% + 0px);
}
.navbar .nav_list li.sub_list.active a:after {
  transform: rotate(45deg);
}
.navbar .nav_list li.sub_list.active .sub_nav {
  max-height: 600px;
  opacity: 1;
  visibility: visible;
  transform: scaleY(1);
}

.Group-1544 {
  width: 24px;
  height: 24px;
}

@media (max-width: 1280px) {
  .profile_details {
    margin-bottom: 24% !important;
  }
}

.profile_details {
  margin-bottom: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 32px 16px 24px;
  border-top: 1px solid var(--step-100);
  position: relative;
  cursor: pointer;
  border-right: 1px solid var(--step-100);
}
.profile_details:after {
  content: none !important  ;
  width: 7px;
  height: 7px;
  border-right: 2px solid var(--primary);
  border-bottom: 2px solid var(--primary);
  transform: rotate(-45deg);
  position: absolute;
  right: 14px;
  top: calc(50% - 3px);
  transition: all ease-in-out 0.3s;
}
.profile_details:hover:after {
  right: 12px;
}
.profile_details .profile_icon {
  min-width: 48px;
  max-width: 48px;
  margin-right: 0px;
}
.profile_details .pro_text {
  flex-grow: 1;
  max-width: calc(100% - 64px);
}
.profile_details .pro_text h5 {
  font-size: var(--f14);
  font-weight: 500;
  color: var(--step-250);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile_details .pro_text h6 {
  font-size: var(--f12);
  font-weight: 500;
  color: var(--step-200);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.disabled-for-now {
  pointer-events: none;
  cursor: not-allowed;
}
.data-summary {
  padding-bottom: 10px;
}
.data-summary p {
  color: black;
  text-align: left;
  font-size: 16px;
  font-weight: 100;
  overflow: hidden;
  text-overflow: ellipsis !important;
  padding-top: 2%;
  border-bottom: 1px solid lightgray;
  padding-bottom: 2%;
}
.output {
  font-size: 16px;
  color: black;
  box-sizing: content-box;
  display: block;
  float: right;
  white-space: nowrap;
  text-overflow: ellipsis !important;
}
.el-dialog__wrapper >>> .el-dialog {
  border-radius: 16px;
  min-width: 450px;
}
.el-dialog__wrapper >>> .el-dialog__header {
  background-image: linear-gradient(to bottom, #e8edf2, #e9ecf2);
  display: flex;
  justify-content: space-between;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  margin-bottom: 0px;
}
.el-dialog__wrapper >>> .el-dialog__title {
  color: black !important;
}

.el-dialog__wrapper >>> .el-dialog__body {
  max-height: 75vh;
  overflow: hidden;
  overflow-y: scroll;
  padding: 10px !important;
}

.hideLabel {
  display: none;
  transition: all ease-in-out 0.4s;
}

@media only screen and (max-width: 500px) {
  .el-dialog__wrapper >>> .el-dialog {
    border-radius: 16px;
    min-width: 90vw;
  }
}
</style>

import Vue from "vue";
import Router from "vue-router";
import home from "./pages/home/home.vue";
import dashboardCrm from "./pages/dashboardCRM/index.vue";
import login from "./pages/login/login.vue";
import financials from "./pages/financials/financials.vue";
import projectListViewHome from "./pages/home/components/projectListViewHome.vue";
import productOrders from "./pages/productOrders/index.vue";
import supportTicket from "./pages/supportTicket/index.vue";
import customTariff from "./pages/customTariff/customTariff.vue";
import datasheet from "./pages/datasheet/datasheet.vue";

import { isCrmUser } from "./utils";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/login",
      name: "login",
      component: login,
    },
    {
      path: "/arkaLogin",
      name: "arkaLogin",
      component: login,
    },
    // This page does not work
    // {
    //     path: "/waaree/login",
    //     name: "waareeLogin",
    //     component: () => import ("./pages/login.vue")
    // },
    {
      path: "/",
      name: "home",
      component: () => {
        if (isCrmUser()) {
          return import("./pages/dashboardCRM/index.vue");
        } else {
          return import("./pages/home/home.vue");
        }
      },
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "https://software.arka.energy/activity",
      name: "tasks",
      // component: tasks,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/projects",
      name: "projectListViewHome",
      component: projectListViewHome,
      meta: {
        requiresAuth: true,
      },
    },
    {
      // path: "/projectManagement",
      path: "https://software.arka.energy/projects",
      name: "projectManagement",
      // component: projectManagement,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/productOrders",
      name: "productOrders",
      component: productOrders,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/leadmanagement",
      name: "leadManagement",
      component: () => import("./pages/leadManagement/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/leadSummary/:leadId",
      name: "leadSummary",
      component: () => import("./pages/designSummaryCRM/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/leadSummary/:leadId/design/:designId",
      name: "leadSummary:design",
      component: () => import("./pages/designSummaryCRM/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      // path: "/roleManagement",
      path: "https://software.arka.energy/org/roles",
      name: "roleManagement",
      // component: roleManagement,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/integration",
      name: "integration",
      component: () => import("./pages/integration/integration.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/supportTicket",
      name: "supportTicket",
      component: supportTicket,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/admin",
      name: "admin",
      component: () => import("./pages/admin/admin.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/wireSizeCalculator/:designId",
      name: "wireSizeCalculator",
      component: () =>
        import("./pages/wireSizeCalculator/wireSizeCalculator.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/media/:surveyId",
      name: "mediaBox",
      component: () => import("./pages/media/mediaBox.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/wireSizeCalculatorDownload/:designId",
      name: "wireSizeCalculatorDownload",
      component: () =>
        import("./pages/wireSizeCalculatorDownload/wireSizeCalculator.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/detailedBOM/:designId",
      name: "detailedBOM",
      component: () => import("./pages/detailedBOM/detailedBOM.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/detailedBOMDownload/:designId",
      name: "detailedBOMDownload",
      component: () =>
        import("./pages/detailedBOMDownload/detailedBOMDownload.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/organisationSummary",
      name: "organisationSummary",
      component: () =>
        import(
          "./pages/organisation/organisationProfile/organisationSummary.vue"
        ),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/organisationDefaults",
      name: "organisationDefaults",
      component: () =>
        import("./pages/organisation/organisationDefaults_new/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/inventory",
      name: "inventory",
      component: () =>
        import("./pages/organisation/organisationInventory/inventory.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/userManagement",
      name: "userManagement",
      component: () => import("./pages/userManagement/index.vue"),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: "profile",
          name: "profile",
          component: () =>
            import("./pages/userManagement/components/myProfile.vue"),
        },
        {
          path: "team",
          name: "team",
          component: () =>
            import("./pages/userManagement/components/myTeam.vue"),
        },
      ],
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/userManagement/team/:userId",
      name: "teamMember",
      component: () => import("./pages/userProfile/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    // {
    //     path: "/userProfile",
    //     name: "userProfile",
    //     component: () => import ("./pages/userProfile/userProfile.vue"),
    //     meta: {
    //         requiresAuth: true,
    //     },
    // },
    {
      path: "/studio/:designId",
      name: "studio",
      component: () => import("./pages/studio/studio.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/stage/:designUUID",
      name: "DesignOverview",
      component: () => import("./pages/designOverview/DesignOverview.vue"),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: "/stage-report/:designUUID",
      name: "ReportStage",
      component: () => import("./pages/studio/stage/ReportStage.vue"),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: "/projectSummary/:projectId",
      name: "projectSummary",
      component: () => import("./pages/project/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/projectSummary/:projectId/orderService/:serviceId",
      name: "orderService",
      component: () => import("./pages/project/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/designSummary/:designId",
      name: "designSummary",
      component: () => import("./pages/design/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/designSummary/datasheet/:designId",
      name: "datasheet",
      component: datasheet,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/pricing",
      name: "pricing",
      component: () => import("./pages/pricing/pricing.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/order-summary",
      name: "orderSummary",
      component: () => import("./pages/pricing/orderSummary.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/payment-response",
      name: "response",
      component: () => import("./pages/pricing/payment/response.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/error/",
      name: "error",
      component: () => import("./pages/error/index.vue"),
    },
    {
      path: "/systemPricing",
      name: "systemPrice",
      component: () => import("./pages/webProposal/systemPricing.vue"),
    },
    {
      path: "/resetPassword",
      name: "resetPassword",
      component: () => import("./pages/login/resetPassword.vue"),
    },
    // {
    //     path: "/signup",
    //     name: "signup",
    //     component: () => import ("./pages/login/signup.vue"),
    // },
    {
      path: "/activate/:activationId/:timeStamp",
      name: "activate",
      component: () => import("./pages/verifyUser/activate.vue"),
    },
    {
      path: "/customTariff",
      name: "customTariff",
      component: customTariff,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/incentives",
      name: "incentives",
      component: () => import("./pages/incentives/incentives.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/projectSummary/consumptionProfile/:projectId",
      name: "consumptionProfile",
      component: () =>
        import("./pages/consumptionProfile/consumptionProfile.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/financials",
      name: "financials",
      component: financials,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/credits",
      name: "credits",
      component: () => import("./pages/credits/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "project",
      name: "project",
      component: () => import("./pages/project/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/dashboard/success/:paymentId",
      name: "dashboard",
      component: () => import("./pages/dashboard/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/dashboard/failed",
      name: "dashboard",
      component: () => import("./pages/dashboard/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/orders",
      name: "orders",
      component: () => import("./pages/orders/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    // for redirection of unknown routes and calling parameterized routes without parameters
    {
      path: "*",
      redirect: "/",
    },
    // Web Proposal
    {
      path: "/webProposal/:designUUID",
      name: "webProposal",
      // component: webProposal,
      component: () => import("./pages/webProposal/webProposal.vue"),
      meta: {
        requiresAuth: false,
      },
    },

    // Document Proposal
    {
      path: "/documentProposal/:designId",
      name: "documentProposal",
      // component: webProposal,
      component: () => import("./pages/webProposal/documentProposal.vue"),
      meta: {
        requiresAuth: true,
      },
    },

    // Document Proposal for end user:
    {
      path: "/documentProposalRef/:referenceId",
      name: "documentProposalRef",
      // component: webProposal,
      component: () => import("./pages/webProposal/documentProposal.vue"),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: "/documentProposalRef/:referenceId/puppeteer/:date/:token",
      name: "documentProposalPuppeteer",
      // component: webProposal,
      component: () => import("./pages/webProposal/documentProposal.vue"),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: "/dashboard_crm",
      name: "dashboardCRM",
      component: () => import("./pages/dashboardCRM/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/addersAndDiscounts",
      name: "addersAndDiscounts",
      component: () => import("./pages/AND/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/designOrders",
      name: "designOrders",
      component: () => import("./pages/designOrders/index.vue"),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/esUsers",
      name: "esUsers",
      component: () =>
        import("./pages/designOrders/manageUsersAndShiftsIndex.vue"),
      meta: {
        requiresAuth: true,
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { x: 0, y: 0 };
  },
});

// Token check for each page before route change
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { token } = user;
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  router.fromPage = from;
  router.toPage = to;

  if (to.name == "home") {
    if (isCrmUser()) {
      to.matched[0].components.default = dashboardCrm;
    } else {
      to.matched[0].components.default = home;
    }
  }

  if (to.name === "admin" && user.role === "ADMIN") {
    next();
  } else if (to.name === "admin" && user.role !== "ADMIN") {
    next("/");
  }
  if (to.name === "organisationDefaults" && user.role === "ADMIN") {
    next();
  } else if (to.name === "organisationDefaults" && user.role !== "ADMIN") {
    next("/");
  }
  if (to.name === "organisationSummary" && user.role === "ADMIN") {
    next();
  } else if (to.name === "organisationSummary" && user.role !== "ADMIN") {
    next("/");
  }
  if (to.name === "pricing" && user.role === "ADMIN") {
    next();
  } else if (to.name === "pricing" && user.role !== "ADMIN") {
    next("/");
  } else if (to.name === "integration" && Object.keys(to.query).length > 0) {
    // saving projectData in sessionstorage coming from salesforce.
    sessionStorage.setItem("projectData", JSON.stringify(to.query));
  }
  if (requiresAuth && !token) {
    next("/login");
  } else if (requiresAuth && token) {
    next();
  } else {
    next();
  }
});

router.goBackOrGoHome = () => {
  if (router.fromPage.name) {
    router.back();
  } else {
    router.push({ name: "home" });
  }
};

// Error handling for when page routing fails, due to new builds
router.onError((error) => {
  console.error(error);
  let reloadCondition =
    !window.location.origin.includes("localhost") &&
    error.message.includes("imported module");
  if (reloadCondition) {
    window.location = router.toPage.fullPath;
  }
});

export default router;

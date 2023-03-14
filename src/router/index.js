import { createRouter, createWebHistory } from "vue-router";
import {getRoles} from "@/store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/update",
      name: "update",
      component: () => import("../views/UpdateView.vue"),
      // meta : { authorization: ["ROLE_ADMIN"] }
    },
    {
      path: "/create",
      name: "create",
      component: () => import("../views/CreateView.vue"),
      // meta : { authorization: ["ROLE_MEMBER"] }
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      // meta : { authorization: [] }
    },
    {
      path: "/",
      name: "search",
      component: () => import("../views/SearchView.vue"),
      // meta : { authorization: ["ROLE_MEMBER"] }
    },
  ]
});

// router.beforeEach((to, from, next) => {
//   const { authorization } = to.meta;
//
//   if(authorization.length == 0) {
//     return next();
//   } else {
//     const roles = getRoles();
//     roles.forEach((role) => {
//       if (authorization.includes(role)){
//         return next();
//       }
//     });
//   }
//
//   alert("로그인이 필요합니다.");
//   next({path: "/"});
// });

export default router;

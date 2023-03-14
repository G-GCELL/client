import { createRouter, createWebHistory } from "vue-router";
import {getRoles} from "../store";
import {getToken} from "../store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/update",
      name: "update",
      component: () => import("../views/UpdateView.vue"),
      meta : { authorization: ["ROLE_ADMIN"] }
    },
    {
      path: "/create",
      name: "create",
      component: () => import("../views/CreateView.vue"),
      meta : { authorization: ["ROLE_MEMBER"] }
    },
    {
      path: "/",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta : { authorization: [] }
    },
    {
      path: "/search",
      name: "search",
      component: () => import("../views/SearchView.vue"),
      meta : { authorization: ["ROLE_MEMBER"] }
    },
  ]
});

router.beforeEach((to, from, next) => {
  const { authorization } = to.meta;
  let flag = false;

  if(authorization.length == 0) {
    flag = true;
    return next();
  } else {
    if(getToken()){
      const roles = getRoles();
      roles.forEach((role) => {
        if (authorization.includes(role)){
          flag = true;
          return next();
        }
      });
    }
  }

  if (!flag) {
    alert("로그인이 필요합니다.");
  }
  return next({path: "/"});
});

export default router;

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/auth",
    name: "Auth",
    component: () => import("@/views/AuthView.vue"),
  },
  {
    path: "/collection",
    alias: "/",
    name: "Collection",
    component: () => import("@/views/CollectionView/CollectionView.vue"),
    meta: { auth: true },
    children: [
      {
        path: "playlist/:playlistKind",
        name: "CollectionPlaylist",
        component: () => import("@/components/collection/PlaylistInfo.vue"),
      },
    ],
  },
  {
    path: "/player",
    name: "Player",
    component: () => import("@/views/PlayerView/PlayerView.vue"),
    meta: { auth: true },
  },
  {
    path: "/playlist",
    name: "Playlist",
    component: () => import("@/views/PlaylistView/PlaylistView.vue"),
    meta: { auth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach((to: any, from: any) => {
  const token = localStorage.getItem("ymToken");

  if (to.meta.auth && to.name !== "Auth") {
    if (!token) {
      return {
        name: "Auth",
      };
    } else {
      return true;
    }
  }

  if (to.name === "Auth" && token) {
    return {
      name: from.name,
    };
  } else {
    return true;
  }
});

export default router;

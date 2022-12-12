import axios from "axios";
import useSWR from "swr";
import jwt from "jsonwebtoken";
import { compareDates } from "../dates";

const formatMenu = (menu) => ({
  id: menu.id,
  title: menu.title.rendered,
  date: menu.meta.menu_date,
  createdAt: menu.date,
  updatedAt: menu.modified,
  userId: menu.author,
  dorucak: JSON.parse(menu.meta.dorucak),
  rucak: JSON.parse(menu.meta.rucak),
  vecera: JSON.parse(menu.meta.vecera),
  ostalo: JSON.parse(menu.meta.ostalo),
  image: menu.image_url,
  imageId: menu.featured_media,
  description: menu.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  content: menu.content.rendered,
});

const fetcher = async (url) => {
  const token = window.localStorage.getItem("access_token");
  const userId = jwt.decode(token).id;

  return axios
    .get(url, {
      params: {
        timestamp: new Date().getTime(),
        status: ["publish", "draft"],
        author: userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data.map((menu) => formatMenu(menu)));
};

export const useMenus = () => {
  const { data, error, mutate } = useSWR("/menus", fetcher);

  return {
    menus: data,
    error: error,
    loading: !data && !error,
    setMenus: mutate,
  };
};

export const useMenuToday = () => {
  const { data, error, mutate } = useSWR("/menus", fetcher);

  const menu = data
    ? data?.filter((menu) =>
        compareDates(menu.date, new Date().toISOString().split("T")[0])
      )[0]
    : null;

  return {
    menu: menu,
    error: error,
    setMenu: mutate,
  };
};

export const createMenu = async (menu) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(
      "/menus",
      {
        title: "Menu",
        status: "publish",
        meta: {
          menu_date: menu.date,
          dorucak: JSON.stringify(menu.dorucak),
          rucak: JSON.stringify(menu.rucak),
          vecera: JSON.stringify(menu.vecera),
          ostalo: JSON.stringify(menu.ostalo),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      const menu = formatMenu(response.data);
      // axios.post("/api/pusher", { event: "menu", data: menu });
      return menu;
    });
};

export const updateMenu = async (menuId, menu) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(
      "/menus/" + menuId,
      {
        meta: {
          menu_date: menu.date && menu.date,
          dorucak: JSON.stringify(menu.dorucak),
          rucak: JSON.stringify(menu.rucak),
          vecera: JSON.stringify(menu.vecera),
          ostalo: JSON.stringify(menu.ostalo),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => {
      const menu = formatMenu(response.data);
      // axios.post("/api/pusher", { event: "menu", data: menu });
      return menu;
    });
};

export const deleteMenu = async (menuId) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .delete("/menus/" + menuId, {
      params: {
        force: true,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data?.previous?.id);
};

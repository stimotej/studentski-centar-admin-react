import axios from "axios";
import useSWR from "swr";
import jwt from "jsonwebtoken";

const formatMenu = (menu) => ({
  id: menu.id,
  title: menu.title.rendered,
  date: menu.meta.date,
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

const fetcher = async (url, date) => {
  const token = window.localStorage.getItem("access_token");
  const userId = jwt.decode(token).id;

  return axios
    .get(url, {
      params: {
        timestamp: new Date().getTime(),
        status: ["publish", "draft"],
        author: userId,
        date: date && date,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.data.map((menu) => formatMenu(menu)));
};

export const useMenus = () => {
  const { data, error, mutate } = useSWR(
    "https://unaprijedi.com/wp-json/wp/v2/menus",
    fetcher
  );

  return {
    menus: data,
    error: error,
    setMenus: mutate,
  };
};

export const useMenuToday = () => {
  const { data, error, mutate } = useSWR(
    [
      "https://unaprijedi.com/wp-json/wp/v2/menus",
      new Date().toISOString().split("T")[0],
    ],
    fetcher
  );

  return {
    menu: data && data[0],
    error: error,
    setMenus: mutate,
  };
};

export const createMenu = async (menu) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(
      "https://unaprijedi.com/wp-json/wp/v2/menus",
      {
        title: "Menu",
        status: "publish",
        meta: {
          date: menu.date,
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
    .then((response) => formatMenu(response.data));
};

export const updateMenu = async (menuId, menu) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(
      "https://unaprijedi.com/wp-json/wp/v2/menus/" + menuId,
      {
        meta: {
          date: menu.date && menu.date,
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
    .then((response) => formatMenu(response.data));
};

export const deleteMenu = async (menuId) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .delete("https://unaprijedi.com/wp-json/wp/v2/menus/" + menuId, {
      params: {
        force: true,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data?.previous?.id);
};

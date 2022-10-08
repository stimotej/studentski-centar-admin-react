import axios from "axios";
import useSWR from "swr";
import { obavijestiCategoryId } from "../constants";

const formatObavijest = (obavijest) => ({
  id: obavijest.id,
  title: obavijest.title.rendered,
  image: obavijest.image_url,
  imageId: obavijest.featured_media,
  description: obavijest.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  content: obavijest.content.rendered,
  categories: obavijest.categories,
  link: obavijest.link,
  date: obavijest.date,
  status: obavijest.status,
  author: obavijest.author_meta.display_name,
  start_showing: obavijest.meta.start_showing,
  end_showing: obavijest.meta.end_showing,
  show_always: obavijest.meta.show_always,
});

const fetcher = (url) =>
  axios
    .get(url, {
      params: {
        categories: obavijestiCategoryId,
        per_page: 100,
        timestamp: new Date().getTime(),
        status: ["publish", "draft"],
      },
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem("access_token")}`,
      },
    })
    .then((res) =>
      res.data?.map((obavijest) => {
        console.log("obavijesti: ", obavijest);
        return formatObavijest(obavijest);
      })
    );

export const useObavijesti = () => {
  const { data, error, mutate } = useSWR("/posts", fetcher);

  return {
    obavijesti: data,
    error: error,
    setObavijesti: mutate,
  };
};

export const createObavijest = async (obavijest) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(
      "/posts",
      {
        title: obavijest?.title,
        excerpt: obavijest?.description,
        content: obavijest?.content,
        featured_media: obavijest?.imageId,
        status: obavijest?.status,
        categories: [obavijestiCategoryId, obavijest?.category],
        meta: {
          start_showing: obavijest?.startShowing,
          end_showing: obavijest?.endShowing,
          show_always: obavijest?.showAlways,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => formatObavijest(response.data))
    .catch((err) => console.log("post obavijest error", err.response));
};

export const updateObavijest = async (obavijestId, obavijest) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(
      "/posts/" + obavijestId,
      {
        title: obavijest?.title,
        excerpt: obavijest?.description,
        content: obavijest?.content,
        featured_media: obavijest?.imageId,
        status: obavijest?.status,
        categories: [obavijestiCategoryId, obavijest?.category],
        meta: {
          start_showing: obavijest?.startShowing,
          end_showing: obavijest?.endShowing,
          show_always: obavijest?.showAlways,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => formatObavijest(response.data));
};

export const deleteObavijest = async (obavijestId) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .delete("/posts/" + obavijestId, {
      params: {
        force: true,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data?.previous?.id)
    .catch((err) => console.log("err del ", err.response));
};

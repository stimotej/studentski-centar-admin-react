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
  date: obavijest.date,
  status: obavijest.status,
  author: obavijest.author_meta.display_name,
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
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
    .then((res) => res.data?.map((obavijest) => formatObavijest(obavijest)));

export const useObavijesti = () => {
  const { data, error, mutate } = useSWR(
    "https://unaprijedi.com/wp-json/wp/v2/posts",
    fetcher
  );

  return {
    obavijesti: data,
    error: error,
    setObavijesti: mutate,
  };
};

export const createObavijest = async (obavijest) => {
  const token = localStorage.getItem("access_token");

  return axios
    .post(
      "https://unaprijedi.com/wp-json/wp/v2/posts",
      {
        title: obavijest?.title,
        excerpt: obavijest?.description,
        content: obavijest?.content,
        featured_media: obavijest?.imageId,
        status: obavijest?.status,
        categories: [obavijestiCategoryId],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => formatObavijest(response.data));
};

export const updateObavijest = async (obavijestId, obavijest) => {
  const token = localStorage.getItem("access_token");

  return axios
    .post(
      "https://unaprijedi.com/wp-json/wp/v2/posts/" + obavijestId,
      {
        title: obavijest?.title,
        excerpt: obavijest?.description,
        content: obavijest?.content,
        featured_media: obavijest?.imageId,
        status: obavijest?.status,
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
  const token = localStorage.getItem("access_token");

  return axios
    .delete("https://unaprijedi.com/wp-json/wp/v2/posts/" + obavijestId, {
      params: {
        force: true,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data?.previous?.id);
};

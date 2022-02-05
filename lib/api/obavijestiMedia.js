import axios from "axios";
import useSWR from "swr";
import { obavijestiCategoryId } from "../constants";

const formatMedia = (media) => ({
  id: media.id,
  title: media.title.rendered,
  src: media.source_url,
  alt: media.alt_text,
  date: media.date,
  author: media.author_meta.display_name,
  width: media.media_details.width,
  height: media.media_details.height,
});

const croToEngString = (str) => {
  var translate_re = /[čćđšž]/g;
  var translate = {
    č: "c",
    ć: "c",
    đ: "d",
    š: "s",
    ž: "z",
  };
  return str.replace(translate_re, function (match) {
    return translate[match];
  });
};

const fetcher = (url) =>
  axios
    .get(url, {
      params: {
        categories: obavijestiCategoryId,
        per_page: 100,
        timestamp: new Date().getTime(),
      },
    })
    .then((res) => res.data?.map((media) => formatMedia(media)));

export const useMedia = () => {
  const { data, error, mutate } = useSWR(
    "https://unaprijedi.com/wp-json/wp/v2/media",
    fetcher
  );

  return {
    mediaList: data,
    error: error,
    setMediaList: mutate,
  };
};

export const createMedia = async (body, type, name) => {
  const token = localStorage.getItem("access_token");

  return axios
    .post("https://unaprijedi.com/wp-json/wp/v2/media", body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": type,
        Accept: "application/json",
        "Content-Disposition":
          'attachment; filename="' + croToEngString(name) + '"',
      },
      params: {
        categories: obavijestiCategoryId,
      },
    })
    .then((response) =>
      axios
        .post(
          "https://unaprijedi.com/wp-json/wp/v2/media/" + response.data.id,
          {
            categories: obavijestiCategoryId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => formatMedia(response.data))
    );
};

export const updateMedia = async (mediaId, { title, alt }) => {
  const token = localStorage.getItem("access_token");

  return axios
    .post(
      "https://unaprijedi.com/wp-json/wp/v2/media/" + mediaId,
      {
        title: title,
        alt_text: alt,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => formatMedia(response.data));
};

export const deleteMedia = async (mediaId) => {
  const token = localStorage.getItem("access_token");

  return axios
    .delete("https://unaprijedi.com/wp-json/wp/v2/media/" + mediaId, {
      params: {
        force: true,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.data?.previous?.id);
};

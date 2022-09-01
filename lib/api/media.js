import axios from "axios";

// const mediaUrl = "https://unaprijedi.com/wp-json/wp/v2/media";
const mediaUrl = "http://161.53.174.14/wp-json/wp/v2/media";

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

export const createMedia = async (body, type, name) => {
  const token = window.localStorage.getItem("access_token");

  return axios
    .post(mediaUrl, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": type,
        Accept: "application/json",
        "Content-Disposition":
          'attachment; filename="' + croToEngString(name) + '"',
      },
    })
    .then((response) => response.data.id);
};

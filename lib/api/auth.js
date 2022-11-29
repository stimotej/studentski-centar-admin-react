import axios from "axios";
import jwt from "jsonwebtoken";
import { userGroups } from "../constants";

// const url = "https://unaprijedi.com/?rest_route=/simple-jwt-login/v1/auth";
const url = "http://161.53.174.14/?rest_route=/simple-jwt-login/v1/auth";

export const login = async (loginFrom, username, password) => {
  //   let userExists = false;
  //   for (const group in userGroups) {
  //     if (userGroups[group].includes(username)) userExists = true;
  //   }

  //   if(userExists)

  return axios
    .post(url, {
      username,
      password,
    })
    .then((response) => {
      if (!userGroups[loginFrom].includes(username))
        return {
          wrongCategory: true,
          message: "Ne možete se prijavljivati u druge kategorije",
        };
      window.localStorage.setItem("access_token", response.data.data.jwt);
      window.localStorage.setItem(
        "username",
        jwt.decode(response.data.data.jwt).username
      );
      axios.defaults.headers.common.Authorization = `Bearer ${response.data.data.jwt}`;
    });
};

export const logout = () => {
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("username");
  delete axios.defaults.headers.common["Authorization"];
};

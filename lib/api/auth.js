import axios from "axios";
import { userGroups } from "../constants";

export const login = async (loginFrom, username, password) => {
  //   let userExists = false;
  //   for (const group in userGroups) {
  //     if (userGroups[group].includes(username)) userExists = true;
  //   }

  //   if(userExists)

  return axios
    .post("https://unaprijedi.com/?rest_route=/simple-jwt-login/v1/auth", {
      username,
      password,
    })
    .then((response) => {
      if (!userGroups[loginFrom].includes(username))
        return {
          wrongCategory: true,
          message: "Ne možete se prijavljivati u druge kategorije",
        };
      localStorage.setItem("access_token", response.data.data.jwt);
    });
};

export const logout = () => {
  localStorage.removeItem("access_token");
};

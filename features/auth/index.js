import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import jwt from "jsonwebtoken";
import { useState } from "react";
import { toast } from "react-toastify";
import { userGroups } from "../../lib/constants";

// const url = "https://unaprijedi.com/?rest_route=/simple-jwt-login/v1/auth";
const url = "http://161.53.174.14/?rest_route=/simple-jwt-login/v1/auth";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const login = async ({ from, username, password }) => {
    setIsLoading(true);
    try {
      const loginRes = await axios.post(url, {
        username,
        password,
      });
      const userRes = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/users/me",
        {
          headers: {
            Authorization: `Bearer ${loginRes.data.data.jwt}`,
          },
          params: {
            JWT: loginRes.data.data.jwt,
          },
        }
      );
      queryClient.setQueryData(["user"], userRes.data);
      // const loginFrom = from === "student-servis" ? "student_servis" : from;
      // if (!userRes.data?.data?.roles.includes(loginFrom)) {
      //   throw new Error("wrong_group");
      // }
      window.localStorage.setItem("access_token", loginRes.data.data.jwt);
      window.localStorage.setItem(
        "roles",
        JSON.stringify(userRes.data?.data?.roles)
      );
      axios.defaults.headers.common.Authorization = `Bearer ${loginRes.data.data.jwt}`;
      axios.defaults.params = {};
      axios.defaults.params["JWT"] = loginRes.data.data.jwt;
      return userRes;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error("Pogrešno korisničko ime ili lozinka");
      }
      // if (error.message === "wrong_group") {
      //   throw new Error("Ne možete se prijavljivati u druge grupe");
      // }
      throw new Error("Greška prilikom slanja zahtjeva");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};

export const useUser = (options) => {
  return useQuery(
    ["user"],
    async () => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/users/me"
      );
      return response.data;
    },
    options
  );
};

export const useResetEmail = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (email) => {
      const responseUser = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/users/me",
        {
          email,
        }
      );
      const responseEmail = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/reset-password",
        {
          user_login: email,
        }
      );
      toast.success(responseEmail?.data?.message);
      return responseUser.data;
    },
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(["user"]);
      },
      onError: (error) => {
        if (error.response.data.code === "rest_user_invalid_email")
          toast.error("Email adresa se već koristi");
        else toast.error("Došlo je do greške");
      },
    }
  );
};

export const useResetPassword = () => {
  return useMutation(
    async (email) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/reset-password",
        {
          user_login: email,
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (error) => {
        if (error.response.data.code === "rest_user_invalid_email")
          toast.error("Email adresa se već koristi");
        else toast.error("Došlo je do greške");
      },
    }
  );
};

export const logout = () => {
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("roles");
  delete axios.defaults.headers.common["Authorization"];
  axios.defaults.params = {};
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

// const url = "https://www.sczg.unizg.hr/wp-json/jwt-auth/v1/token";
const url = "https://www.sczg.unizg.hr/wp-json/jwt-auth/v1/token";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async ({ from, username, password }) => {
    setIsLoading(true);
    try {
      delete axios.defaults.headers.common["Authorization"];
      const response = await axios.post(url, {
        username,
        password,
      });
      window.localStorage.setItem("access_token", response.data?.token);
      axios.defaults.headers.common.Authorization = `Bearer ${response.data?.token}`;
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error("Pogrešno korisničko ime ili lozinka");
      }
      throw new Error("Greška prilikom slanja zahtjeva");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};

export const useCheckAuth = () => {
  return useMutation(
    async () => {
      const response = await axios.post(
        "https://www.sczg.unizg.hr/wp-json/jwt-auth/v1/token/validate"
      );

      return response.data;
    },
    {
      onError: () => {
        logout();
      },
    }
  );
};

export const useUser = (options) => {
  return useQuery(
    ["user"],
    async () => {
      const response = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/users/me"
      );
      window.localStorage.setItem(
        "roles",
        JSON.stringify(response.data?.data?.roles)
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
        "https://www.sczg.unizg.hr/wp-json/wp/v2/users/me",
        {
          email,
        }
      );
      const responseEmail = await axios.post(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/reset-password",
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
        "https://www.sczg.unizg.hr/wp-json/wp/v2/reset-password",
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

export function logout() {
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("roles");
  delete axios.defaults.headers.common["Authorization"];
}

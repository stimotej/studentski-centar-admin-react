import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { CATERING_ROLE, EVENTI_ROLE, TURIZAM_ROLE } from "../../lib/constants";
import { JWT_API, WP_API } from "../../lib/wp";

// const url = "https://www.sczg.unizg.hr/wp-json/jwt-auth/v1/token";
const url = `${JWT_API}/token`;

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

      const roleMap = {
        turizam: TURIZAM_ROLE,
        eventi: EVENTI_ROLE,
        catering: CATERING_ROLE,
      };

      const userHasRole =
        !!response.data?.user_roles &&
        (Array.isArray(response.data?.user_roles)
          ? response.data?.user_roles.includes(roleMap[from])
          : Object.values(response.data?.user_roles).includes(roleMap[from]));

      if (Object.keys(roleMap).includes(from) && !userHasRole) {
        throw new Error("role-forbidden");
      }

      window.localStorage.setItem("access_token", response.data?.token);
      axios.defaults.headers.common.Authorization = `Bearer ${response.data?.token}`;
      return response.data;
    } catch (error) {
      if (error.response?.data?.code === "[jwt_auth] incorrect_password") {
        throw new Error("Pogrešno korisničko ime ili lozinka");
      }
      if (error.message === "role-forbidden") {
        throw new Error("Nemate pristup sučelju za uređivanje ove stranice");
      }
      throw new Error("Greška prilikom slanja zahtjeva");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};

export const useCheckAuth = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const response = await axios.post(
        `${JWT_API}/token/validate`
      );

      return response.data;
    },
    {
      onError: () => {
        logout();
        queryClient.removeQueries();
      },
    }
  );
};

export const useUser = (options) => {
  return useQuery(
    ["user"],
    async () => {
      const response = await axios.get(
        `${WP_API}/users/me`
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

export const useChangePassword = () => {
  return useMutation(
    async ({ login, currentPassword, newPassword }) => {
      // WordPress lets a logged-in user set a new password without the old one,
      // so the current password is checked first against the token endpoint.
      // fetch rather than axios, so the stored Bearer header is not sent along.
      const check = await fetch(`${JWT_API}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: login, password: currentPassword }),
      });
      if (!check.ok) {
        const body = await check.json().catch(() => ({}));
        const message =
          body?.code === "[jwt_auth] incorrect_password"
            ? "Trenutna lozinka nije točna"
            : "Provjera trenutne lozinke nije uspjela, pokušajte kasnije";
        throw Object.assign(new Error(message), { userMessage: message });
      }

      const response = await axios.post(`${WP_API}/users/me`, {
        password: newPassword,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success("Lozinka je promijenjena");
      },
      onError: (error) => {
        toast.error(error.userMessage || "Došlo je do greške");
      },
    }
  );
};

export const useResetPassword = () => {
  return useMutation(
    async (email) => {
      const response = await axios.post(
        `${WP_API}/reset-password`,
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

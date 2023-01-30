import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import pageKeys from "./queries";

export const usePage = (id, options) => {
  return useQuery(
    pageKeys.page(id),
    async () => {
      const response = await axios.get(
        `http://161.53.174.14/wp-json/wp/v2/pages/${id}`
      );
      return response.data;
    },
    {
      ...options,
    }
  );
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, data }) => {
      const response = await axios.post(
        `http://161.53.174.14/wp-json/wp/v2/pages/${id}`,
        data
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Promjene uspješno spremljene.");
        return queryClient.invalidateQueries(pageKeys.page(data.id));
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za uređivanje ovih podataka.");
        else toast.error("Greška kod spremanja.");
      },
    }
  );
};

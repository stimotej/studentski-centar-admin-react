import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import pageKeys from "./queries";

export const usePage = (id, options) => {
  return useQuery(
    pageKeys.page(id),
    async () => {
      const response = await axios.get(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/pages/${id}`
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
        `https://www.sczg.unizg.hr/wp-json/wp/v2/pages/${id}`,
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

export const useCreatePageFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, question, answer }) => {
      const response = await axios.post(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/pages/${id}/faq`,
        {
          question,
          answer,
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Pitanje je uspješno dodano.");
        queryClient.invalidateQueries(pageKeys.page(parseInt(data)));
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za dodavanje pitanja.");
        else toast.error("Greška kod spremanja.");
      },
    }
  );
};

export const useUpdatePageFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, faqId, question, answer }) => {
      const response = await axios.put(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/pages/${id}/faq/${faqId}`,
        {
          question,
          answer,
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Pitanje je uspješno uređeno.");
        return queryClient.invalidateQueries(pageKeys.page(parseInt(data)));
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za uređivanje pitanja.");
        else toast.error("Greška kod spremanja.");
      },
    }
  );
};

export const useDeletePageFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, faqId }) => {
      const response = await axios.delete(
        `https://www.sczg.unizg.hr/wp-json/wp/v2/pages/${id}/faq/${faqId}`
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Pitanje je uspješno obrisano.");
        return queryClient.invalidateQueries(pageKeys.page(parseInt(data)));
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za brisanje pitanja.");
        else toast.error("Greška kod spremanja.");
      },
    }
  );
};

import {
  useQueryClient,
  useMutation,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import { toast } from "react-toastify";
import formatContactMail from "./format";
import contactMailKeys from "./queries";

export const useContactMails = (filters, options) => {
  const postsPerPage = 10;
  const totalPages = useRef(0);

  return useInfiniteQuery(
    contactMailKeys.contactMailsFiltered(filters),
    async ({ pageParam }) => {
      const response = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/contact_mails",
        {
          params: {
            categories: filters?.categoryId,
            orderby: filters?.orderby,
            order: filters?.order,
            search: filters?.search,
            per_page: postsPerPage,
            page: pageParam,
            timestamp: new Date().getTime(),
          },
        }
      );
      totalPages.current = response.headers?.["x-wp-totalpages"];
      return response.data;
    },
    {
      select: (data) => ({
        ...data,
        pages: data.pages.flatMap((page) =>
          page.map((obavijest) => formatContactMail(obavijest))
        ),
      }),
      getNextPageParam: (lastPage, pages) => {
        if (pages.length + 1 <= totalPages.current) return pages.length + 1;
      },
      ...options,
    }
  );
};

export const useDeleteContactMail = (displayToasts = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id }) => {
      const response = await axios.delete(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/contact_mails/" + id,
        {
          params: {
            force: true,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        if (displayToasts) toast.success("Kontakt mail je uspješno obrisan.");
        return queryClient.invalidateQueries(contactMailKeys.contactMails);
      },
      onError: (error) => {
        if (displayToasts) {
          if (error.response.data.data.status === 403)
            toast.error("Nemate dopuštenje za brisanje ovog kontakt maila.");
          else toast.error("Greška kod brisanja kontakt maila.");
        }
      },
    }
  );
};

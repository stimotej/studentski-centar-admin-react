import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import formatMedia from "./format";
import mediaKeys from "./queries";
import { toast } from "react-toastify";
import { useRef } from "react";

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

export const useMedia = (filters, options) => {
  const mediaPerPage = 12;
  const totalPages = useRef(0);

  return useInfiniteQuery(
    mediaKeys.mediaFiltered(filters),
    async ({ pageParam }) => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/media",
        {
          params: {
            categories: filters?.categoryId,
            orderby: filters?.orderby,
            order: filters?.order,
            search: filters?.search,
            per_page: mediaPerPage,
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
        pages: data.pages.map((page) =>
          page.map((media) => formatMedia(media))
        ),
      }),
      getNextPageParam: (lastPage, pages) => {
        if (pages.length + 1 <= totalPages.current) return pages.length + 1;
      },
      ...options,
    }
  );
};

export const useMediaById = (id, options) => {
  return useQuery(
    mediaKeys.oneMedia(id),
    async () => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/media/" + id
      );
      return response.data;
    },
    {
      select: (data) => formatMedia(data),
      ...options,
    }
  );
};

export const useCreateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ body, type, name, categoryId }) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/media",
        body,
        {
          headers: {
            "Content-Type": type,
            Accept: "application/json",
            "Content-Disposition":
              'attachment; filename="' + croToEngString(name) + '"',
          },
        }
      );
      await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/media/" + response.data.id,
        {
          categories: categoryId,
        }
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        toast.success("Uspješan prijenos datoteke");
        return queryClient.invalidateQueries(mediaKeys.allMedia);
      },
      onError: () => {
        toast.error("Greška kod prijenosa datoteke");
      },
    }
  );
};

export const useUpdateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, title, alt }) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/media/" + id,
        {
          title: title,
          alt_text: alt,
        }
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        toast.success("Uspješno spremanje medija");
        return queryClient.invalidateQueries(mediaKeys.allMedia);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za uređivanje ovog medija");
        else toast.error("Greška kod spremanja medija");
      },
    }
  );
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await axios.delete(
        "http://161.53.174.14/wp-json/wp/v2/media/" + id,
        {
          params: {
            force: true,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: async () => {
        toast.success("Uspješno brisanje medija");
        return queryClient.invalidateQueries(mediaKeys.allMedia);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za brisanje ovog medija");
        else toast.error("Greška kod brisanja medija");
      },
    }
  );
};

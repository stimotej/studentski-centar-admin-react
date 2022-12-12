import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { obavijestiCategoryId } from "../../lib/constants";
import formatObavijest from "./format";
import obavijestiKeys from "./queries";
import { toast } from "react-toastify";
import { useRef } from "react";

export const useObavijesti = (filters, options) => {
  const postsPerPage = 10;
  const totalPages = useRef(0);

  return useInfiniteQuery(
    obavijestiKeys.obavijestiFiltered(filters),
    async ({ pageParam }) => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/posts",
        {
          params: {
            categories: obavijestiCategoryId,
            orderby: filters?.orderby,
            order: filters?.order,
            search: filters?.search,
            per_page: postsPerPage,
            page: pageParam,
            timestamp: new Date().getTime(),
            status: ["publish", "draft"],
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
          page.map((obavijest) => formatObavijest(obavijest))
        ),
      }),
      getNextPageParam: (lastPage, pages) => {
        if (pages.length + 1 <= totalPages.current) return pages.length + 1;
      },
      ...options,
    }
  );
};

export const useCategories = (options) => {
  return useQuery(
    obavijestiKeys.categories,
    async () => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/categories"
      );
      return response.data;
    },
    {
      select: (data) =>
        data.filter((item) => item.parent === obavijestiCategoryId),
      ...options,
    }
  );
};

export const useCreateObavijest = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (obavijest) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/posts",
        {
          title: obavijest?.title,
          excerpt: obavijest?.description,
          content: obavijest?.content,
          featured_media: obavijest?.imageId,
          status: obavijest?.status,
          categories: [obavijestiCategoryId, obavijest?.category],
          meta: {
            start_showing: obavijest?.startShowing,
            end_showing: obavijest?.endShowing,
            show_always: obavijest?.showAlways,
            event_date: obavijest?.eventDate,
          },
        }
      );
      return formatObavijest(response.data);
    },
    {
      onSuccess: () => {
        toast.success("Obavijest je uspješno izrađena.");
        return queryClient.invalidateQueries(obavijestiKeys.obavijesti);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za izradu obavijesti.");
        else toast.error("Greška kod izrade obavijesti.");
      },
    }
  );
};

export const useUpdateObavijest = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, obavijest }) => {
      const response = await axios.post(
        `http://161.53.174.14/wp-json/wp/v2/posts/${id}`,
        {
          title: obavijest?.title,
          excerpt: obavijest?.description,
          content: obavijest?.content,
          featured_media: obavijest?.imageId,
          status: obavijest?.status,
          categories: [obavijestiCategoryId, obavijest?.category],
          meta: {
            start_showing: obavijest?.startShowing,
            end_showing: obavijest?.endShowing,
            show_always: obavijest?.showAlways,
            event_date: obavijest?.eventDate,
          },
        }
      );
      return formatObavijest(response.data);
    },
    {
      onSuccess: () => {
        toast.success("Obavijest je uspješno spremljena.");
        return queryClient.invalidateQueries(obavijestiKeys.obavijesti);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za izmjenu ove obavijesti.");
        else toast.error("Greška kod spremanja obavijesti.");
      },
    }
  );
};

export const useDeleteObavijest = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await axios.delete(
        `http://161.53.174.14/wp-json/wp/v2/posts/${id}`,
        {
          params: {
            force: true,
          },
        }
      );
      return response.data?.previous?.id;
    },
    {
      onSuccess: () => {
        toast.success("Uspješno obrisana obavijest");
        return queryClient.invalidateQueries(obavijestiKeys.obavijesti);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za brisanje ove obavijesti");
        else toast.error("Greška kod brisanja obavijesti");
      },
    }
  );
};

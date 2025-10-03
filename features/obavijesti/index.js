import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import axios from "axios";
import {
  cateringCategoryId,
  eventiCategoryId,
  obavijestiCategoryId,
  pocetnaStranicaCategoryId,
  teatarTdCategoryId,
  turizamCategoryId,
} from "../../lib/constants";
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
        "https://www.sczg.unizg.hr/wp-json/wp/v2/obavijesti",
        {
          params: {
            categories: filters?.categoryId,
            orderby: filters?.orderby,
            order: filters?.order,
            search: filters?.search,
            per_page: postsPerPage,
            page: pageParam,
            timestamp: new Date().getTime(),
            status: ["publish", "draft"],
            categories_exclude:
              !filters?.categoryId ||
              filters?.categoryId === obavijestiCategoryId
                ? [
                    pocetnaStranicaCategoryId,
                    turizamCategoryId,
                    eventiCategoryId,
                    cateringCategoryId,
                    teatarTdCategoryId,
                  ]
                : undefined,
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

export const useObavijest = (id, options) => {
  return useQuery(
    obavijestiKeys.obavijest(id),
    async () => {
      const response = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/obavijesti/" + id
      );
      return response.data;
    },
    {
      select: (data) => formatObavijest(data),
      ...options,
    }
  );
};

export const useCategories = (options) => {
  return useQuery(
    obavijestiKeys.categories,
    async () => {
      const response = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/categories",
        {
          params: {
            parent: obavijestiCategoryId,
            exclude: [
              pocetnaStranicaCategoryId,
              turizamCategoryId,
              eventiCategoryId,
              cateringCategoryId,
              teatarTdCategoryId,
            ],
          },
        }
      );
      return response.data;
    },
    {
      ...options,
    }
  );
};

export const useCreateObavijest = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (obavijest) => {
      const response = await axios.post(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/obavijesti",
        {
          title: obavijest?.title,
          excerpt: obavijest?.description,
          content: obavijest?.content,
          featured_media: obavijest?.imageId,
          status: obavijest?.status,
          categories: obavijest?.categories,
          meta: {
            start_showing: obavijest?.startShowing,
            end_showing: obavijest?.endShowing,
            show_always: obavijest?.showAlways,
            event_date: obavijest?.eventDate,
            documents: obavijest?.documents,
            featured: obavijest?.featured,
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
        `https://www.sczg.unizg.hr/wp-json/wp/v2/obavijesti/${id}`,
        {
          title: obavijest?.title,
          excerpt: obavijest?.description,
          content: obavijest?.content,
          featured_media: obavijest?.imageId,
          status: obavijest?.status,
          categories: obavijest?.categories,
          meta: {
            start_showing: obavijest?.startShowing,
            end_showing: obavijest?.endShowing,
            show_always: obavijest?.showAlways,
            event_date: obavijest?.eventDate,
            documents: obavijest?.documents,
            featured: obavijest?.featured,
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
        `https://www.sczg.unizg.hr/wp-json/wp/v2/obavijesti/${id}`,
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

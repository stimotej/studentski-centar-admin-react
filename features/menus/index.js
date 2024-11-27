import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import formatMenu from "./format";
import menuKeys from "./queries";
import dayjs from "dayjs";

export const useMenus = (filters, options) => {
  const queryClient = useQueryClient();

  const menusPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMenus = async (newFilters) => {
    const response = await axios.get(
      "https://www.sczg.unizg.hr/wp-json/wp/v2/menus",
      {
        params: {
          orderby: newFilters?.orderby,
          order: newFilters?.order,
          search: newFilters?.search,
          per_page: menusPerPage,
          page: newFilters?.search ? undefined : newFilters?.page,
          restaurant: newFilters?.restaurantId,
          status: ["publish", "draft"],
        },
      }
    );
    setTotalItems(+(response.headers?.["x-wp-total"] || "0"));
    setTotalPages(+(response.headers?.["x-wp-totalpages"] || "0"));
    return response.data;
  };

  const queryData = useQuery(
    menuKeys.menusFiltered(filters),
    async () => fetchMenus(filters),
    {
      select: (data) => data.map((product) => formatMenu(product)),
      keepPreviousData: true,
      staleTime: 5000,
      ...options,
    }
  );

  useEffect(() => {
    if (!queryData.isPreviousData && filters?.page < totalPages)
      queryClient.prefetchQuery(
        menuKeys.menusFiltered({ ...filters, page: filters?.page + 1 }),
        () => fetchMenus({ ...filters, page: filters?.page + 1 })
      );
  }, [
    queryData.data,
    queryData.isPreviousData,
    filters,
    queryClient,
    totalPages,
  ]);

  return {
    ...queryData,
    itemsPerPage: menusPerPage,
    totalNumberOfItems: totalItems,
  };
};

export const useMenusByDate = ({ date, restaurantId }, options) => {
  return useQuery(
    menuKeys.menuByDate({ date, restaurantId }),
    async () => {
      const response = await axios.get(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/menus",
        {
          params: {
            menu_date: date,
            restaurant: restaurantId,
            orderby: "date",
            order: "asc",
            status: ["publish", "draft"],
          },
        }
      );
      return response.data;
    },
    {
      select: (menus) => menus.map((menu) => formatMenu(menu)),
      staleTime: Infinity,
      ...options,
    }
  );
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (menu) => {
      const response = await axios.post(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/menus",
        {
          title: menu.title,
          status: "draft",
          meta: {
            menu_date: dayjs(menu.menu_date).format("YYYY-MM-DD"),
            menu_products: menu.products,
            menu_restaurant_id: menu.restaurantId,
          },
        }
      );
      return formatMenu(response.data);
    },
    {
      onSuccess: () => {
        toast.success("Menu je uspješno izrađen.");
        return queryClient.invalidateQueries(menuKeys.menus);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za izradu menija.");
        else toast.error("Greška kod izrade menija.");
      },
    }
  );
};

export const useUpdateMenu = (displayToasts = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (menu) => {
      const response = await axios.post(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/menus/" + menu.id,
        {
          title: menu?.title,
          slug: menu?.title,
          status: menu?.status,
          meta: {
            menu_date:
              menu.menu_date && dayjs(menu.menu_date).format("YYYY-MM-DD"),
            menu_products: menu.products,
            menu_restaurant_id: menu.restaurantId,
          },
        }
      );
      return formatMenu(response.data);
    },
    {
      onSuccess: () => {
        if (displayToasts) toast.success("Menu je uspješno spremljen.");
        return queryClient.invalidateQueries(menuKeys.menus);
      },
      onError: (error) => {
        if (displayToasts) {
          if (error.response.data.data.status === 403)
            toast.error("Nemate dopuštenje za izmjenu ovog menija.");
          else toast.error("Greška kod spremanja menija.");
        }
      },
    }
  );
};

export const useDeleteMenu = (displayToasts = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await axios.delete(
        "https://www.sczg.unizg.hr/wp-json/wp/v2/menus/" + id,
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
        if (displayToasts) toast.success("Menu je uspješno obrisan.");
        return queryClient.invalidateQueries(menuKeys.menus);
      },
      onError: (error) => {
        if (displayToasts) {
          if (error.response.data.data.status === 403)
            toast.error("Nemate dopuštenje za brisanje ovog menija.");
          else toast.error("Greška kod brisanja menija.");
        }
      },
    }
  );
};

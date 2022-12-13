import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useEffect } from "react";
import { toast } from "react-toastify";
import formatMenu from "./format";
import menuKeys from "./queries";
import jwt from "jsonwebtoken";

export const useMenus = (filters, options) => {
  const queryClient = useQueryClient();

  const menusPerPage = 10;
  const totalItems = useRef(0);
  const totalPages = useRef(0);

  const fetchProducts = async (newFilters) => {
    const token = window.localStorage.getItem("access_token");
    const userId = jwt.decode(token).id;

    const response = await axios.get(
      "http://161.53.174.14/wp-json/wp/v2/menus",
      {
        params: {
          orderby: newFilters?.orderby,
          order: newFilters?.order,
          search: newFilters?.search,
          per_page: menusPerPage,
          page: newFilters?.page,
          timestamp: new Date().getTime(),
          author: userId,
        },
      }
    );
    totalItems.current = response.headers?.["x-wp-total"];
    totalPages.current = response.headers?.["x-wp-totalpages"];
    return response.data;
  };

  const queryData = useQuery(
    menuKeys.menusFiltered(filters),
    async () => fetchProducts(filters),
    {
      select: (data) => data.map((product) => formatMenu(product)),
      keepPreviousData: true,
      staleTime: 5000,
      ...options,
    }
  );

  useEffect(() => {
    if (!queryData.isPreviousData && filters?.page < totalPages.current)
      queryClient.prefetchQuery(
        menuKeys.menusFiltered({ ...filters, page: filters?.page + 1 }),
        () => fetchProducts({ ...filters, page: filters?.page + 1 })
      );
  }, [queryData.data, queryData.isPreviousData, filters, queryClient]);

  return {
    ...queryData,
    itemsPerPage: menusPerPage,
    totalNumberOfItems: totalItems.current,
  };
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (menu) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/menus",
        {
          title: "Menu",
          status: "publish",
          meta: {
            menu_date: menu.menu_date,
            dorucak: JSON.stringify(menu.dorucak),
            rucak: JSON.stringify(menu.rucak),
            vecera: JSON.stringify(menu.vecera),
            ostalo: JSON.stringify(menu.ostalo),
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
        "http://161.53.174.14/wp-json/wp/v2/menus/" + menu.id,
        {
          meta: {
            menu_date: menu.menu_date && menu.menu_date,
            dorucak: JSON.stringify(menu.dorucak),
            rucak: JSON.stringify(menu.rucak),
            vecera: JSON.stringify(menu.vecera),
            ostalo: JSON.stringify(menu.ostalo),
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
        "http://161.53.174.14/wp-json/wp/v2/menus/" + id,
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
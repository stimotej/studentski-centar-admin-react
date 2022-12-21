import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRef, useEffect } from "react";
import { toast } from "react-toastify";
import formatProduct from "./format";
import productKeys from "./queries";

export const useProducts = (filters, options) => {
  const queryClient = useQueryClient();

  const productsPerPage = 10;
  const totalItems = useRef(0);
  const totalPages = useRef(0);

  const fetchProducts = async (newFilters) => {
    const response = await axios.get(
      "http://161.53.174.14/wp-json/wp/v2/proizvodi",
      {
        params: {
          orderby: newFilters?.orderby,
          order: newFilters?.order,
          search: newFilters?.search,
          per_page: newFilters?.productsPerPage || productsPerPage,
          page: newFilters?.page,
          timestamp: new Date().getTime(),
        },
      }
    );
    totalItems.current = response.headers?.["x-wp-total"];
    totalPages.current = response.headers?.["x-wp-totalpages"];
    return response.data;
  };

  const queryData = useQuery(
    productKeys.productsFiltered(filters),
    async () => fetchProducts(filters),
    {
      select: (data) => data.map((product) => formatProduct(product)),
      keepPreviousData: true,
      staleTime: 5000,
      ...options,
    }
  );

  useEffect(() => {
    if (!queryData.isPreviousData && filters?.page < totalPages.current)
      queryClient.prefetchQuery(
        productKeys.productsFiltered({ ...filters, page: filters?.page + 1 }),
        () => fetchProducts({ ...filters, page: filters?.page + 1 })
      );
  }, [queryData.data, queryData.isPreviousData, filters, queryClient]);

  return {
    ...queryData,
    itemsPerPage: productsPerPage,
    totalNumberOfItems: totalItems.current,
  };
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (product) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/proizvodi",
        {
          title: product?.name,
          status: "publish",
          excerpt: product?.description,
          featured_media: product?.image,
          meta: {
            price: product?.price,
            stock_status: product?.stockStatus,
            allergens: product?.allergens,
            weight: product?.weight,
          },
        }
      );
      return formatProduct(response.data);
    },
    {
      onSuccess: () => {
        toast.success("Proizvod je uspješno izrađen.");
        return queryClient.invalidateQueries(productKeys.products);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za izradu proizvoda.");
        else toast.error("Greška kod izrade proizvoda.");
      },
    }
  );
};

export const useUpdateProduct = (displayToasts = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (product) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/proizvodi/" + product.id,
        {
          title: product?.name,
          excerpt: product?.description,
          featured_media: product?.image,
          meta: {
            price: product?.price,
            stock_status: product?.stockStatus,
            allergens: product?.allergens,
            weight: product?.weight,
          },
        }
      );
      return formatProduct(response.data);
    },
    {
      onSuccess: () => {
        if (displayToasts) toast.success("Proizvod je uspješno spremljen.");
        return queryClient.invalidateQueries(productKeys.products);
      },
      onError: (error) => {
        if (displayToasts) {
          if (error.response.data.data.status === 403)
            toast.error("Nemate dopuštenje za izmjenu ovog proizvoda.");
          else toast.error("Greška kod spremanja proizvoda.");
        }
      },
    }
  );
};

export const useDeleteProduct = (displayToasts = true) => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id) => {
      const response = await axios.delete(
        "http://161.53.174.14/wp-json/wp/v2/proizvodi/" + id,
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
        if (displayToasts) toast.success("Proizvod je uspješno obrisan.");
        return queryClient.invalidateQueries(productKeys.products);
      },
      onError: (error) => {
        if (displayToasts) {
          if (error.response.data.data.status === 403)
            toast.error("Nemate dopuštenje za brisanje ovog proizvoda.");
          else toast.error("Greška kod brisanja proizvoda.");
        }
      },
    }
  );
};

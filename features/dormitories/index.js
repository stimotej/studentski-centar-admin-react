import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import dormitoryKeys from "./queries";
import {
  dormitoryCategoryId,
  dormitoryDefaultMediaId,
} from "../../lib/constants";
import formatDormitory from "./format";

export const useDormitories = (options) => {
  return useQuery(
    dormitoryKeys.dormitories,
    async () => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/posts",
        {
          params: {
            categories: dormitoryCategoryId,
            order: "asc",
            timestamp: new Date().getTime(),
            status: ["publish", "draft"],
            per_page: 100,
          },
        }
      );
      return response.data;
    },
    {
      select: (data) => data.map((dormitory) => formatDormitory(dormitory)),
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useDormitory = (id, options) => {
  return useQuery(
    dormitoryKeys.dormitory(id),
    async () => {
      const response = await axios.get(
        `http://161.53.174.14/wp-json/wp/v2/posts/${id}`,
        {
          params: {
            timestamp: new Date().getTime(),
          },
        }
      );
      return response.data;
    },
    {
      select: (data) => formatDormitory(data[0]),
      ...options,
    }
  );
};

export const useCreateDormitory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ title, status }) => {
      const response = await axios.post(
        `http://161.53.174.14/wp-json/wp/v2/posts`,
        {
          title,
          status,
          categories: [dormitoryCategoryId],
          featured_media: dormitoryDefaultMediaId,
          status: "draft",
        }
      );
      return formatDormitory(response.data);
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno dodan dom.");
        return queryClient.invalidateQueries(dormitoryKeys.dormitories);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za dodavanje domova.");
        else toast.error("Greška kod dodavanja doma.");
      },
    }
  );
};

export const useUpdateDormitory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (dormitory) => {
      const response = await axios.post(
        `http://161.53.174.14/wp-json/wp/v2/posts/${dormitory.id}`,
        {
          title: dormitory?.title,
          excerpt: dormitory?.excerpt,
          featured_media: dormitory?.imageId,
          meta: {
            sadrzaj: dormitory?.sadrzaj,
            kontakt: dormitory?.kontakt,
            lokacija: dormitory?.lokacija,
            image_groups: dormitory?.image_groups,
          },
          status: "publish",
        }
      );
      return formatDormitory(response.data);
    },
    {
      onSuccess: () => {
        toast.success("Dom je uspješno spremljen.");
        return queryClient.invalidateQueries(dormitoryKeys.dormitories);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za izmjenu ovoga doma.");
        else toast.error("Greška kod spremanja doma.");
      },
    }
  );
};

export const useDeleteDormitory = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id }) => {
      const response = await axios.delete(
        `http://161.53.174.14/wp-json/wp/v2/posts/${id}`,
        {
          params: {
            force: true,
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno obrisan dom.");
        return queryClient.invalidateQueries(dormitoryKeys.dormitories);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za brisanje domova.");
        else toast.error("Greška kod brisanja doma.");
      },
    }
  );
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { adminPostsCategory } from "../../lib/constants";
import formatPost from "./format";
import postsKeys from "./queries";

export const usePosts = (filters, options) => {
  return useQuery(
    postsKeys.postsFiltered(filters),
    async () => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/posts",
        {
          params: {
            order: "asc",
            categories: `${adminPostsCategory},${filters?.category}`,
            timestamp: new Date().getTime(),
            status: ["publish", "draft"],
          },
        }
      );
      return response.data;
    },
    {
      select: (data) => data.map((post) => formatPost(post)),
      ...options,
    }
  );
};

export const usePost = (id, options) => {
  return useQuery(
    postsKeys.post(id),
    async () => {
      const response = await axios.get(
        `http://161.53.174.14/wp-json/wp/v2/posts/${id}`
      );
      return response.data;
    },
    {
      select: (data) => formatPost(data),
      staleTime: Infinity,
      ...options,
    }
  );
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ title, excerpt, content, status, category, documents }) => {
      const response = await axios.post(
        `http://161.53.174.14/wp-json/wp/v2/posts`,
        {
          title,
          excerpt,
          content,
          status,
          categories: [adminPostsCategory, category],
          meta: {
            documents,
          },
        }
      );
      return formatPost(response.data);
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno dodano.");
        queryClient.invalidateQueries(postsKeys.posts);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za dodavanje.");
        else toast.error("Greška kod dodavanja.");
      },
    }
  );
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ id, title, excerpt, content, status, documents }) => {
      const response = await axios.post(
        `http://161.53.174.14/wp-json/wp/v2/posts/${id}`,
        {
          title,
          excerpt,
          content,
          status,
          meta: {
            documents,
          },
        }
      );
      return formatPost(response.data);
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno uređeno.");
        queryClient.invalidateQueries(postsKeys.posts);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za uređivanje.");
        else toast.error("Greška kod uređivanja.");
      },
    }
  );
};

export const useDeletePost = () => {
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
        toast.success("Uspješno obrisano.");
        queryClient.invalidateQueries(postsKeys.posts);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za brisanje.");
        else toast.error("Greška kod brisanja.");
      },
    }
  );
};

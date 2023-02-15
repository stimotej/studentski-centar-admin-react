import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import jwt from "jsonwebtoken";
import restaurantKeys from "./queries";
import formatRestaurant from "./format";
import {
  restaurantCategoryId,
  restaurantDefaultMediaId,
} from "../../lib/constants";

export const useRestaurants = (options) => {
  return useQuery(
    restaurantKeys.restaurants,
    async () => {
      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/posts",
        {
          params: {
            categories: restaurantCategoryId,
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
      select: (data) => data.map((restaurant) => formatRestaurant(restaurant)),
      ...options,
    }
  );
};

export const useRestaurant = (options) => {
  return useQuery(
    restaurantKeys.restaurant,
    async () => {
      const token = window.localStorage.getItem("access_token");
      var currentUserId = jwt.decode(token).id;

      const response = await axios.get(
        "http://161.53.174.14/wp-json/wp/v2/posts",
        {
          params: {
            author: currentUserId,
            categories: restaurantCategoryId,
            timestamp: new Date().getTime(),
          },
        }
      );
      return response.data;
    },
    {
      select: (data) => formatRestaurant(data[0]),
      ...options,
    }
  );
};

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ title, status }) => {
      const response = await axios.post(
        `http://161.53.174.14/wp-json/wp/v2/posts`,
        {
          title,
          status,
          categories: [restaurantCategoryId],
          featured_media: restaurantDefaultMediaId,
          status: "draft",
        }
      );
      return formatRestaurant(response.data);
    },
    {
      onSuccess: (data) => {
        toast.success("Uspješno dodan restoran.");
        queryClient.invalidateQueries(restaurantKeys.restaurants);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za dodavanje restorana.");
        else toast.error("Greška kod dodavanja restorana.");
      },
    }
  );
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (restaurant) => {
      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/posts/" + restaurant.id,
        {
          title: restaurant?.title,
          featured_media: restaurant?.imageId,
          meta: {
            ponuda: restaurant?.ponuda,
            radno_vrijeme: restaurant?.radnoVrijeme,
            restaurant_info: restaurant?.info,
          },
          tags: restaurant?.tags,
          status: "publish",
        }
      );
      return formatRestaurant(response.data);
    },
    {
      onSuccess: () => {
        toast.success("Restoran je uspješno spremljen.");
        return queryClient.invalidateQueries(restaurantKeys.restaurants);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za izmjenu ovoga restorana.");
        else toast.error("Greška kod spremanja restorana.");
      },
    }
  );
};

export const useDeleteRestaurant = () => {
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
        toast.success("Uspješno obrisan restoran.");
        queryClient.invalidateQueries(restaurantKeys.restaurants);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za brisanje restorana.");
        else toast.error("Greška kod brisanja restorana.");
      },
    }
  );
};

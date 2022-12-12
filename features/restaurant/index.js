import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import jwt from "jsonwebtoken";
import restaurantKeys from "./queries";
import formatRestaurant from "./format";

const usersRestaurantIds = {
  6: 1111,
  7: 1107,
  8: 638,
  12: 4678,
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

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (restaurant) => {
      const token = window.localStorage.getItem("access_token");
      const currentUserId = jwt.decode(token).id;
      const restaurantId = usersRestaurantIds[currentUserId];

      const response = await axios.post(
        "http://161.53.174.14/wp-json/wp/v2/posts/" + restaurantId,
        {
          title: restaurant?.title,
          excerpt: restaurant?.description,
          featured_media: restaurant?.imageId,
          meta: restaurant?.meta,
          tags: restaurant?.tags,
        }
      );
      return formatRestaurant(response.data);
    },
    {
      onSuccess: () => {
        toast.success("Restoran je uspješno spremljen.");
        return queryClient.invalidateQueries(productKeys.products);
      },
      onError: (error) => {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za izmjenu ovoga restorana.");
        else toast.error("Greška kod spremanja restorana.");
      },
    }
  );
};

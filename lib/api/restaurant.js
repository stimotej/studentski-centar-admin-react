import axios from "axios";
import useSWR from "swr";
import jwt from "jsonwebtoken";

const formatRestaurant = (restaurant) => ({
  id: restaurant.id,
  title: restaurant.title.rendered,
  image: restaurant.image_url,
  description: restaurant.excerpt.rendered,
  category_id: restaurant.meta.kategorija_proizvoda,
});

const usersRestaurantIds = {
  6: 1111,
  7: 1107,
  8: 638,
};

const fetcher = async (url) => {
  const token = window.localStorage.getItem("access_token");
  var currentUserId = jwt.decode(token).id;

  return axios
    .get(url, {
      params: {
        author: currentUserId,
        timestamp: new Date().getTime(),
      },
    })
    .then((res) => formatRestaurant(res.data[0]));
};

export const useRestaurant = () => {
  const { data, error, mutate } = useSWR(
    "https://unaprijedi.com/wp-json/wp/v2/posts",
    fetcher
  );

  return {
    restaurant: data,
    error: error,
    setRestaurant: mutate,
  };
};

export const updateRestaurant = async (restaurant) => {
  const token = window.localStorage.getItem("access_token");
  const currentUserId = jwt.decode(token).id;
  const restaurantId = usersRestaurantIds[currentUserId];

  return axios
    .post(
      "https://unaprijedi.com/wp-json/wp/v2/posts/" + restaurantId,
      {
        title: restaurant?.title,
        excerpt: restaurant?.description,
        featured_media: restaurant?.imageId,
        meta: restaurant?.meta,
        tags: restaurant?.tags,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((response) => formatRestaurant(response.data));
};

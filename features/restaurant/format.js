const formatRestaurant = (restaurant) => ({
  id: restaurant.id,
  title: restaurant.title.rendered,
  image: restaurant.image_url,
  description: restaurant.excerpt.rendered,
  category_id: restaurant.meta.kategorija_proizvoda,
});

export default formatRestaurant;

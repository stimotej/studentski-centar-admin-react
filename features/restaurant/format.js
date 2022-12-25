const formatRestaurant = (restaurant) => ({
  id: restaurant.id,
  title: restaurant.title.rendered,
  image: restaurant.image_url,
  info: restaurant.meta.restaurant_info,
  ponuda: restaurant.meta.ponuda,
  radnoVrijeme: restaurant.meta.radno_vrijeme,
  category_id: restaurant.meta.kategorija_proizvoda,
});

export default formatRestaurant;

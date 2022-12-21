const formatMenu = (menu) => ({
  id: menu.id,
  title: menu.title.rendered,
  date: menu.meta.menu_date,
  createdAt: menu.date,
  updatedAt: menu.modified,
  userId: menu.author,
  products: menu.meta.menu_products,
  restaurantId: menu.meta.menu_restaurant_id,
  image: menu.image_url,
  imageId: menu.featured_media,
  description: menu.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  content: menu.content.rendered,
});

export default formatMenu;

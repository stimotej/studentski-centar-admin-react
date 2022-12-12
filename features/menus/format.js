const formatMenu = (menu) => ({
  id: menu.id,
  title: menu.title.rendered,
  date: menu.meta.menu_date,
  createdAt: menu.date,
  updatedAt: menu.modified,
  userId: menu.author,
  dorucak: JSON.parse(menu.meta.dorucak),
  rucak: JSON.parse(menu.meta.rucak),
  vecera: JSON.parse(menu.meta.vecera),
  ostalo: JSON.parse(menu.meta.ostalo),
  image: menu.image_url,
  imageId: menu.featured_media,
  description: menu.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  content: menu.content.rendered,
});

export default formatMenu;

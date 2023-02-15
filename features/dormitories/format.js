const formatDormitory = (dormitory) => ({
  id: dormitory.id,
  title: dormitory.title.rendered,
  excerpt: dormitory.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  image: dormitory.image_url,
  imageId: dormitory.featured_media,
  status: dormitory.status,
});

export default formatDormitory;

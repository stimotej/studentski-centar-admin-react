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
  sadrzaj: dormitory.meta.sadrzaj,
  kontakt: dormitory.meta.kontakt,
  lokacija: dormitory.meta.lokacija,
  image_groups: dormitory.meta.image_groups,
});

export default formatDormitory;

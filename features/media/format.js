const formatMedia = (media) => ({
  id: media.id,
  title: media.title.rendered,
  src: media.source_url,
  alt: media.alt_text,
  date: media.date,
  mediaType: media.media_type,
  mimeType: media.mime_type,
  author: media.author_meta.display_name,
  width: media.media_details.width,
  height: media.media_details.height,
  isBanner: media.meta.is_banner,
  bannerUrl: media.meta.banner_url,
});

export default formatMedia;

const formatMedia = (media) => ({
  id: media.id,
  title: media.title.rendered,
  src: media.source_url,
  alt: media.alt_text,
  date: media.date,
  author: media.author_meta.display_name,
  width: media.media_details.width,
  height: media.media_details.height,
});

export default formatMedia;

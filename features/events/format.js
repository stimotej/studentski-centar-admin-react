const formatEvent = (event) => ({
  id: event.id,
  slug: event.slug,
  title: event.title.rendered,
  image: event.image_url,
  imageId: event.featured_media,
  content: event.content.rendered,
  categories: event.categories,
  tags: event.tags,
  link: event.link,
  date: event.date,
  status: event.status,
  author: event.author_meta.display_name,
  dates: event.meta.dates,
  location: event.meta.location,
  type: event.meta.type,
  show_on_slider: event.meta.show_on_slider,
  is_course: event.meta.is_course,
  documents: event.meta.documents,
});

export default formatEvent;

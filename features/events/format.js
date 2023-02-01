const formatEvent = (event) => ({
  id: event.id,
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
  documents: event.meta.documents,
});

export default formatEvent;

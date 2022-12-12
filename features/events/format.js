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
  event_date: event.meta.event_date,
  event_dates: event.meta.event_dates,
  event_id: event.meta.event_id,
  event_location: event.meta.event_location,
  event_type: event.meta.event_type,
});

export default formatEvent;

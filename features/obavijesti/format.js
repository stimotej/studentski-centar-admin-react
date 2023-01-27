const formatObavijest = (obavijest) => ({
  id: obavijest?.id,
  title: obavijest?.title?.rendered,
  image: obavijest?.image_url,
  imageId: obavijest?.featured_media,
  description: obavijest?.excerpt?.rendered
    ?.replace("<p>", "")
    ?.replace("</p>", "")
    ?.replace("\n", ""),
  content: obavijest?.content?.rendered,
  categories: obavijest?.categories,
  category: obavijest?.category_name,
  link: obavijest?.link,
  date: obavijest?.date,
  status: obavijest?.status,
  author: obavijest?.author_meta?.display_name,
  start_showing: obavijest?.meta?.start_showing,
  end_showing: obavijest?.meta?.end_showing,
  show_always: obavijest?.meta?.show_always,
  event_date: obavijest?.meta?.event_date,
  documents: obavijest?.meta?.documents,
});

export default formatObavijest;

const formatPost = (post) => ({
  id: post.id,
  slug: post.slug,
  title: post.title.rendered,
  excerpt: post.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  content: post.content.rendered,
  documents: post.meta.documents
    ? post.meta.documents?.map((document) => ({
        id: document.id,
        title: document.title,
        media_type: document.mediaType || document.media_type,
        mime_type: document.mimeType || document.mime_type,
        source_url: document.src || document.source_url,
      }))
    : [],
  accordionItems: post.meta.accordion_items
    ? post.meta.accordion_items.map((accordionItem) => ({
        title: accordionItem.title,
        description: accordionItem.description,
      }))
    : [],
  imageId: post.featured_media,
  image: post.image_url,
  categories: post.categories,
  status: post.status,
  sadrzaj: post.meta.sadrzaj,
  radno_vrijeme_blagajni: post.meta.radno_vrijeme_blagajni,
  kontakt: post.meta.kontakt,
  lokacija: post.meta.lokacija,
  image_groups: post.meta.image_groups,
  link: post.meta.link,
});

export default formatPost;

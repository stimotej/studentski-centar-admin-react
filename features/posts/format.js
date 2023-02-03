const formatPost = (post) => ({
  id: post.id,
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
        mediaType: document.media_type,
        mimeType: document.mime_type,
        src: document.source_url,
      }))
    : [],
  categories: post.categories,
  status: post.status,
  image: post.image_url,
  imageId: post.featured_media,
});

export default formatPost;

const formatPost = (post) => ({
  id: post.id,
  title: post.title.rendered,
  excerpt: post.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  content: post.content.rendered,
  documents: post.meta.documents,
  status: post.status,
  image: post.image_url,
  imageId: post.featured_media,
});

export default formatPost;

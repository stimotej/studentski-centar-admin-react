const formatProduct = (product) => ({
  id: product.id,
  name: product.title.rendered,
  description: product.excerpt.rendered
    .replace("<p>", "")
    .replace("</p>", "")
    .replace("\n", ""),
  image: product.image_url,
  imageId: product.featured_media,
  price: product.meta.price,
  stock: product.meta.stock_status,
  allergens: product.meta.allergens,
  link: product.link,
  weight: product.meta.weight,
});

export default formatProduct;

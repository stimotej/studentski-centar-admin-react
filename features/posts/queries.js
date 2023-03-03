const postsKeys = {
  posts: ["posts"],
  postsFiltered: (filters) => [...postsKeys.posts, filters],
  categories: () => [...postsKeys.posts, "categories"],
  categoriesFiltered: (filters) => [...postsKeys.posts, "categories", filters],
  post: (id) => [...postsKeys.posts, id],
};

export default postsKeys;

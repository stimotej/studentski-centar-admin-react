const postsKeys = {
  posts: ["posts"],
  postsFiltered: (filters) => [...postsKeys.posts, filters],
  categories: () => [...postsKeys.posts, "categories"],
  post: (id) => [...postsKeys.posts, id],
};

export default postsKeys;

const postsKeys = {
  posts: ["posts"],
  postsFiltered: (filters) => [...postsKeys.posts, filters],
  post: (id) => [...postsKeys.posts, id],
};

export default postsKeys;

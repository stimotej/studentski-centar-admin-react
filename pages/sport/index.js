import {
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import { useEffect } from "react";
import { useState } from "react";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import {
  useAdminCategories,
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdateCategory,
  useUpdatePost,
} from "../../features/posts";
import { adminSportCategory, sportCategoryId } from "../../lib/constants";
import dynamic from "next/dynamic";
import ReorderImages from "../../components/Elements/ReorderImages";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const SmjestajPage = () => {
  const {
    data: mainCategories,
    isLoading: isLoadingMainCategories,
    isError: isMainCategoriesError,
  } = useAdminCategories({
    parent: adminSportCategory,
  });

  const [activeCategory, setActiveCategory] = useState(0);
  const [activeSubCategory, setActiveSubCategory] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (mainCategories) {
      setActiveCategory(mainCategories[0].id);
    }
  }, [mainCategories]);

  const handleChange = (event, newValue) => {
    setActiveCategory(newValue);
  };

  const {
    data: subCategories,
    isInitialLoading: isLoadingSubCategories,
    isError: isSubCategoriesError,
  } = useAdminCategories(
    {
      parent: activeCategory,
    },
    {
      enabled: activeCategory !== 0,
    }
  );

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts,
  } = usePosts(
    {
      categories: activeCategory,
    },
    {
      enabled: activeCategory !== 0,
    }
  );

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageGroups, setImageGroups] = useState([]);

  useEffect(() => {
    if (posts) {
      const post = posts.find((p) => p.id === page);
      if (!post) {
        setPage(0);
        setTitle("");
        setExcerpt("");
        setContent("");
        return;
      }
      setPage(post.id);
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
    }
  }, [posts, page]);

  useEffect(() => {
    if (mainCategories) {
      const mainCategory = mainCategories.find((c) => c.id === activeCategory);
      setImageGroups(mainCategory?.meta?.image_groups || []);
    }
  }, [mainCategories, activeCategory]);

  const handleSelectPage = (postId, categoryId) => {
    const post = posts.find((d) => d.id === postId);
    if (!post) return;
    setPage(postId);
    setActiveSubCategory(categoryId);
  };

  const [addPostDialog, setAddPostDialog] = useState({
    opened: false,
    categoryId: null,
  });
  const [deletePostDialog, setDeletePostDialog] = useState(false);

  const [dialogTitle, setDialogTitle] = useState("");

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const { mutate: updateCategory, isLoading: isUpdatingCategory } =
    useUpdateCategory();

  const handleCreatePost = () => {
    createPost(
      {
        title: dialogTitle,
        categories: [activeCategory, addPostDialog?.categoryId],
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setAddPostDialog({ opened: false, categoryId: null });
          setDialogTitle("");
          setPage(data.id);
        },
        onError: (err) => {
          console.log("err", err.response.data);
        },
      }
    );
  };

  const handleUpdatePost = () => {
    if (page === 0) {
      updateCategory({
        id: activeCategory,
        meta: {
          image_groups: imageGroups,
        },
      });
    } else {
      updatePost(
        {
          id: page,
          title: title,
          excerpt: excerpt,
          content: content,
          status: "publish",
        },
        {
          onError: (err) => {
            console.log("err", err.response.data);
          },
        }
      );
    }
  };

  const handleDeletePost = () => {
    deletePost(
      {
        id: page,
      },
      {
        onSuccess: () => {
          setDeletePostDialog(false);
          setPage(0);
        },
      }
    );
  };

  return (
    <Layout>
      <Header title="Početna" />
      <div className="px-5 md:px-10 pb-6">
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeCategory} onChange={handleChange}>
            {mainCategories?.map((category) => (
              <Tab
                key={category.id}
                label={category.name}
                value={category.id}
              />
            ))}
          </Tabs>
        </Box>
        {mainCategories?.map((mainCategory) => (
          <TabPanel
            key={mainCategory.id}
            value={activeCategory}
            index={mainCategory.id}
          >
            <div className="flex gap-10 flex-wrap md:flex-nowrap">
              <div>
                <Paper className="md:!min-w-[260px] md:!max-w-[400px] mb-6">
                  <MenuList>
                    <MenuItem selected={page === 0} onClick={() => setPage(0)}>
                      Slike
                    </MenuItem>
                  </MenuList>
                </Paper>
                {isLoadingSubCategories || isLoadingPosts ? (
                  <div className="flex items-center justify-center py-2">
                    <CircularProgress size={24} />
                  </div>
                ) : isSubCategoriesError || isPostsError ? (
                  <div className="flex flex-col text-error my-2 px-4">
                    Greška kod učitavanja
                    <LoadingButton
                      variant="outlined"
                      className="mt-4"
                      onClick={() => refetchPosts()}
                      loading={isRefetchingPosts}
                    >
                      Pokušaj ponovno
                    </LoadingButton>
                  </div>
                ) : posts?.length <= 0 && subCategories?.length <= 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-gray-500 my-2 px-4">
                      Nema informacija za prikaz
                    </div>
                    <LoadingButton
                      className="!mt-2 !w-fit"
                      startIcon={<FontAwesomeIcon icon={faPlus} />}
                      onClick={() =>
                        setAddPostDialog({
                          opened: true,
                          categoryId: activeCategory,
                        })
                      }
                    >
                      Dodaj novu
                    </LoadingButton>
                  </div>
                ) : (
                  <>
                    {posts?.filter(
                      (post) =>
                        post.categories?.includes(activeCategory) &&
                        post.categories?.length === 2
                    ).length > 0 && (
                      <div className="mb-6">
                        <PostsGroup
                          posts={posts}
                          categoryId={activeCategory}
                          page={page}
                          onClick={handleSelectPage}
                          onClickAddPost={() =>
                            setAddPostDialog({
                              opened: true,
                              categoryId: activeCategory,
                            })
                          }
                        />
                      </div>
                    )}
                    {subCategories?.map((category) => (
                      <div key={category.id} className="mb-6">
                        <h3 className="font-semibold mb-2">{category.name}</h3>
                        <PostsGroup
                          posts={posts}
                          categoryId={category.id}
                          page={page}
                          onClick={handleSelectPage}
                          onClickAddPost={() =>
                            setAddPostDialog({
                              opened: true,
                              categoryId: category.id,
                            })
                          }
                        />
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="flex-1">
                {page === 0 ? (
                  <>
                    <h3 className="font-semibold mb-2">Grupe slika</h3>
                    <ReorderImages
                      imageGroups={imageGroups}
                      setImageGroups={setImageGroups}
                      mediaCategoryId={sportCategoryId}
                    />
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold mb-2">Naziv</h3>
                    <QuillTextEditor
                      value={title}
                      onChange={setTitle}
                      formats={[]}
                      className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
                      placeholder="Unesi naslov..."
                      useToolbar={false}
                    />

                    <h3 className="font-semibold mt-4 mb-2">Opis</h3>
                    <QuillTextEditor
                      value={excerpt}
                      onChange={setExcerpt}
                      placeholder="Unesi opis..."
                    />

                    <h3 className="font-semibold mt-4 mb-2">Sadržaj</h3>
                    <QuillTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Unesi sadržaj..."
                    />
                  </>
                )}

                <div className="flex gap-2 items-center mt-6">
                  <LoadingButton
                    variant="contained"
                    loading={isUpdating || isUpdatingCategory}
                    onClick={handleUpdatePost}
                    className="!bg-primary"
                  >
                    Spremi
                  </LoadingButton>
                  {page !== 0 && (
                    <LoadingButton
                      variant="outlined"
                      color="error"
                      onClick={() => setDeletePostDialog(true)}
                    >
                      Obriši
                    </LoadingButton>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>
        ))}
      </div>

      <Dialog
        open={deletePostDialog}
        onClose={() => setDeletePostDialog(false)}
      >
        <DialogTitle>Brisanje informacije</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se briše informacija i link na strnicu informacije. Radnja se
            ne može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeletePostDialog(false)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton
            color="error"
            onClick={handleDeletePost}
            loading={isDeleting}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addPostDialog?.opened}
        onClose={() => {
          setAddPostDialog({ opened: false, categoryId: null });
          setDialogTitle("");
        }}
      >
        <DialogTitle>Dodaj novu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bit će vidljivo na stranici tek nakon što uredite sadržaj i spremite
            promjene.
          </DialogContentText>
          <QuillTextEditor
            value={dialogTitle}
            onChange={setDialogTitle}
            formats={["bold"]}
            containerClassName="mt-2"
            className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
            placeholder="Naslov"
            useToolbar={false}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddPostDialog({ opened: false, categoryId: null });
              setDialogTitle("");
            }}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton onClick={handleCreatePost} loading={isCreating}>
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

function PostsGroup({ posts, categoryId, onClick, onClickAddPost, page }) {
  const filteredPosts = posts?.filter((post) =>
    post.categories.includes(categoryId)
  );
  return (
    <>
      <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
        <MenuList>
          {filteredPosts?.length <= 0 ? (
            <div className="px-4">Nema informacija za prikaz</div>
          ) : (
            filteredPosts?.map((post) => (
              <MenuItem
                key={post.id}
                selected={page === post.id}
                onClick={() => onClick(post.id, categoryId)}
              >
                {post.status === "draft" && (
                  <Tooltip title="Još nije vidljivo na stranici." arrow>
                    <ListItemIcon>
                      <FontAwesomeIcon
                        icon={faTriangleExclamation}
                        className="text-error"
                      />
                    </ListItemIcon>
                  </Tooltip>
                )}
                <ListItemText className="line-clamp-1">
                  <QuillTextEditor
                    value={post.title}
                    useToolbar={false}
                    className="[&>div>div>p]:hover:cursor-pointer [&>div>div]:line-clamp-1"
                    readOnly
                    includeStyles={false}
                  />
                </ListItemText>
              </MenuItem>
            ))
          )}
        </MenuList>
      </Paper>
      <LoadingButton
        className="!mt-2"
        startIcon={<FontAwesomeIcon icon={faPlus} />}
        onClick={() => {
          onClickAddPost(categoryId);
        }}
      >
        Dodaj novu
      </LoadingButton>
    </>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default SmjestajPage;

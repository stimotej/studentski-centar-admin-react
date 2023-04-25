import Header from "../../components/Header";
import Layout from "../../components/Layout";
import React, { useEffect, useState } from "react";
import { adminKulturaCategory, kulturaCategoryId } from "../../lib/constants";
import {
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
  TextField,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import { LoadingButton } from "@mui/lab";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";
import {
  useAdminCategories,
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "../../features/posts";
import dynamic from "next/dynamic";
import clearHtmlFromString from "../../lib/clearHtmlFromString";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const Home = () => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useAdminCategories({
    parent: adminKulturaCategory,
    orderby: "description",
  });

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts,
  } = usePosts(
    {
      categories: adminKulturaCategory,
    },
    {
      enabled: !!categories,
    }
  );

  const [page, setPage] = useState(0);
  const [category, setCategory] = useState(0);

  const [addPostDialog, setAddPostDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  const [deletePostDialog, setDeletePostDialog] = useState(false);

  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (posts) {
      const post = posts.find((d) => d.id === page) || posts?.[0];
      if (!post) return;
      const categoryId =
        categories?.find((c) => post.categories.includes(c.id))?.id ||
        categories?.[0]?.id;
      setPage(post.id);
      setCategory(categoryId);
      setImage(post.imageId);
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setLink(clearHtmlFromString(post.link || ""));
      setSlug(post.slug);
    }
  }, [posts, categories]);

  const handleSelectPage = (postId, categoryId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    setPage(postId);
    setCategory(categoryId);
    setImage(post.imageId);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setLink(post.link);
    setSlug(post.slug);
  };

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreateDormitory = () => {
    createPost(
      {
        title: dialogTitle,
        categories: [adminKulturaCategory, category],
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setAddPostDialog(false);
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
    const post = posts.find((d) => d.id === page);
    if (!post) return;
    updatePost(
      {
        id: page,
        title: title,
        excerpt: excerpt || "<p></p>",
        content: content,
        link: link,
        status: "publish",
        ...(image ? { featuredMedia: image } : {}),
      },
      {
        onError: (err) => {
          console.log("err", err.response.data);
        },
      }
    );
  };

  const handleDeleteDormitory = () => {
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
        <div className="flex gap-10 flex-wrap md:flex-nowrap">
          <div>
            {isLoadingCategories || isLoadingPosts ? (
              <div className="flex items-center justify-center py-2">
                <CircularProgress size={24} />
              </div>
            ) : isCategoriesError || isPostsError ? (
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
            ) : [...posts, ...categories].length <= 0 ? (
              <div className="text-gray-500 my-2 px-4">
                Nema informacija za prikaz
              </div>
            ) : (
              categories?.map((category) => (
                <div key={category.id} className="mb-6">
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
                    <MenuList>
                      {posts?.filter((post) =>
                        post.categories.includes(category.id)
                      ).length <= 0 ? (
                        <div className="px-4">Nema informacija za prikaz</div>
                      ) : (
                        posts
                          ?.filter((post) =>
                            post.categories.includes(category.id)
                          )
                          ?.map((post) => (
                            <MenuItem
                              key={post.id}
                              selected={page === post.id}
                              onClick={() =>
                                handleSelectPage(post.id, category.id)
                              }
                            >
                              {post.status === "draft" && (
                                <Tooltip
                                  title="Još nije vidljivo na stranici."
                                  arrow
                                >
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
                      setAddPostDialog(true);
                      setCategory(category.id);
                    }}
                  >
                    Dodaj novu
                  </LoadingButton>
                </div>
              ))
            )}
          </div>
          <div className="flex-1">
            {categories?.find((post) => post.id === category)?.slug ===
              "stranice-kultura-admin" &&
              !!slug && (
                <>
                  <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                    Poveznica na stranicu
                  </h4>
                  <div className="py-2 px-4 bg-gray-100 rounded-lg w-fit mb-6">
                    http://www.sczg.unizg.hr/informacije/{slug}
                  </div>
                </>
              )}

            {categories?.find((post) => post.id === category)?.slug ===
              "lokacije" && (
              <>
                <h3 className="font-semibold">Slika</h3>
                <SelectMediaInput
                  defaultValue={posts?.find((d) => d.id === page)?.image}
                  onChange={setImage}
                  className="!w-full md:!w-1/2 !bg-transparent border-gray-200"
                  mediaCategoryId={kulturaCategoryId}
                />

                <h3 className="font-semibold mt-4 mb-2">Poveznica</h3>
                <QuillTextEditor
                  value={link}
                  onChange={setLink}
                  formats={[]}
                  className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
                  placeholder="Unesi poveznicu..."
                  useToolbar={false}
                />
              </>
            )}
            <h3 className="font-semibold mt-4 mb-2">Naslov</h3>
            <QuillTextEditor
              value={title}
              onChange={setTitle}
              formats={[]}
              className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
              placeholder="Unesi naslov..."
              useToolbar={false}
            />

            {categories?.find((post) => post.id === category)?.slug ===
              "lokacije" && (
              <>
                <h3 className="font-semibold mt-4 mb-2">Opis</h3>
                <QuillTextEditor
                  value={excerpt}
                  onChange={setExcerpt}
                  placeholder="Unesi opis..."
                  mediaCategoryId={kulturaCategoryId}
                />
              </>
            )}

            {categories?.find((post) => post.id === category)?.slug ===
              "stranice-kultura-admin" && (
              <>
                <h3 className="font-semibold mt-4 mb-2">Sadržaj</h3>
                <QuillTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Unesi sadržaj..."
                  mediaCategoryId={kulturaCategoryId}
                />
              </>
            )}

            <div className="flex gap-2 items-center mt-6">
              <LoadingButton
                variant="contained"
                loading={isUpdating}
                onClick={handleUpdatePost}
                className="!bg-primary"
              >
                Spremi
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                color="error"
                onClick={() => setDeletePostDialog(true)}
              >
                Obriši
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={deletePostDialog}
        onClose={() => setDeletePostDialog(false)}
      >
        <DialogTitle>Brisanje</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se briše stranica i link na strnicu sadržaja. Radnja se ne
            može poništiti.
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
            onClick={handleDeleteDormitory}
            loading={isDeleting}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!addPostDialog}
        onClose={() => {
          setAddPostDialog(null);
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
              setAddPostDialog(null);
              setDialogTitle("");
            }}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton onClick={handleCreateDormitory} loading={isCreating}>
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Home;

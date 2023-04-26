import {
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
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
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import {
  useAdminCategories,
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "../../features/posts";
import {
  aboutUsPostId,
  adminInfoStudentServisCategory,
  adminStudentServisCategory,
  poslovniceCategoryId,
  studentskiServisCategoryId,
} from "../../lib/constants";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";

const Poslovi = () => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useAdminCategories({
    parent: adminStudentServisCategory,
  });

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts(
    {
      categories: adminStudentServisCategory,
    },
    {
      enabled: !!categories,
    }
  );

  const [page, setPage] = useState(aboutUsPostId);
  const [category, setCategory] = useState(0);

  const [addPostDialog, setAddPostDialog] = useState(null);
  const [deletePostDialog, setDeletePostDialog] = useState(false);

  const [dialogTitle, setDialogTitle] = useState("");

  const [mediaId, setMediaId] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (posts) {
      const post = posts.find((post) => post.id === page) || posts?.[0];
      if (!post) return;
      setPage(post.id);
      setMediaId(post.imageId);
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setFiles(post.documents || []);
    }
  }, [posts]);

  const handleSelectPage = (postId, categoryId) => {
    const post = posts.find((post) => post.id === postId);
    if (!post) return;
    setPage(postId);
    setCategory(categoryId);
    setTitle(post.title);
    setMediaId(post.imageId);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setFiles(post.documents || []);
  };

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreatePost = () => {
    createPost(
      {
        title: dialogTitle,
        categories:
          addPostDialog === "info"
            ? [adminStudentServisCategory, adminInfoStudentServisCategory]
            : [adminStudentServisCategory, poslovniceCategoryId],
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setAddPostDialog(null);
          setDialogTitle("");
          setPage(data.id);
        },
      }
    );
  };

  const handleSavePost = () => {
    updatePost({
      id: page,
      title,
      excerpt,
      content,
      status: "publish",
      featuredMedia: mediaId,
      documents:
        files.length > 0 &&
        files.map((file) => ({
          id: file.id,
          title: file.title,
          media_type: file.mediaType || file.media_type,
          mime_type: file.mimeType || file.mime_type,
          source_url: file.src || file.source_url,
        })),
    });
  };

  const handleDeletePost = () => {
    deletePost(
      { id: page },
      {
        onSuccess: () => {
          setDeletePostDialog(false);
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
              <div className="text-gray-500 my-2 px-4">Nema informacija</div>
            ) : (
              categories?.map((category) => (
                <React.Fragment key={category.id}>
                  {category.slug !== "page-part" && (
                    <h3 className="font-semibold mb-2 mt-6">{category.name}</h3>
                  )}
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
                                  containerClassName="!bg-transparent border-none"
                                  className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1 [&>div>div>p]:hover:cursor-pointer"
                                  readOnly
                                />
                              </ListItemText>
                            </MenuItem>
                          ))
                      )}
                    </MenuList>
                  </Paper>
                  {category.slug !== "page-part" && (
                    <LoadingButton
                      className="!mt-2"
                      startIcon={<FontAwesomeIcon icon={faPlus} />}
                      onClick={() => setAddPostDialog(category.slug)}
                    >
                      Dodaj novo
                    </LoadingButton>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
          <div className="flex flex-col items-start gap-4 w-full">
            {page === aboutUsPostId && (
              <div className="w-full">
                <h4 className="uppercase text-sm font-semibold tracking-wide">
                  Slika
                </h4>
                <SelectMediaInput
                  defaultValue={posts?.find((post) => post.id === page)?.image}
                  onChange={setMediaId}
                  className="!w-full md:!w-1/2"
                  mediaCategoryId={studentskiServisCategoryId}
                />
              </div>
            )}
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Naslov
              </h4>
              <QuillTextEditor
                value={title}
                onChange={setTitle}
                formats={["bold"]}
                className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
                placeholder="Unesi naslov..."
                useToolbar={false}
              />
            </div>
            {page !== aboutUsPostId &&
              categories?.find((post) => post.id === category)?.slug ===
                "info" && (
                <div className="w-full">
                  <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                    Kratki opis
                  </h4>
                  <QuillTextEditor
                    value={excerpt}
                    onChange={setExcerpt}
                    useToolbar={false}
                    className="[&>div>div]:!min-h-[100px]"
                    placeholder="Unesi kratki opis..."
                  />
                </div>
              )}
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Sadržaj
              </h4>
              <QuillTextEditor
                value={content}
                onChange={setContent}
                files={files}
                setFiles={setFiles}
                placeholder="Unesi sadržaj..."
              />
            </div>
            <div className="flex !gap-4">
              <LoadingButton
                variant="contained"
                className="!bg-primary"
                onClick={handleSavePost}
                loading={isUpdating}
              >
                Spremi
              </LoadingButton>
              {categories?.find((post) => post.id === category)?.slug !==
                "page-parts" && (
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
      </div>

      <Dialog
        open={!!addPostDialog}
        onClose={() => {
          setAddPostDialog(null);
          setDialogTitle("");
        }}
      >
        <DialogTitle>Dodaj novo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bit će vidljivo na stranici tek nakon što uredite i spremite
            promjene.
          </DialogContentText>
          <QuillTextEditor
            value={dialogTitle}
            onChange={setDialogTitle}
            useToolbar={false}
            containerClassName="mt-2"
            formats={[]}
            className="[&>div>div]:!min-h-fit"
            placeholder="Naslov"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddPostDialog(null)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton onClick={handleCreatePost} loading={isCreating}>
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deletePostDialog}
        onClose={() => setDeletePostDialog(false)}
      >
        <DialogTitle>Brisanje sadržaja</DialogTitle>
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
            onClick={handleDeletePost}
            loading={isDeleting}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Poslovi;

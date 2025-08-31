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
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import {
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "../../features/posts";
import {
  adminCateringCategoryId,
  CATERING_ROLE,
  cateringCategoryId,
  cateringNajamOpremeCategoryId,
  cateringPagesCategoryId,
  cateringPonudaHraneCategoryId,
  cateringPonudaPicaCategoryId,
} from "../../lib/constants";
import { LoadingButton } from "@mui/lab";
import { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";
import { useUser } from "../../features/auth";

const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const PocetnaStranica = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [postData, setPostData] = useState({});
  const [addPostDialog, setAddPostDialog] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [deletePostDialog, setDeletePostDialog] = useState(false);
  const { data: user } = useUser();

  const userHasCateringRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(CATERING_ROLE)
      : Object.values(user.data.roles).includes(CATERING_ROLE));

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({
    categories: adminCateringCategoryId,
  });

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreatePost = () => {
    if (!userHasCateringRole) return;
    if (
      ![
        cateringPonudaHraneCategoryId,
        cateringPonudaPicaCategoryId,
        cateringNajamOpremeCategoryId,
      ].includes(addPostDialog)
    )
      return;

    createPost(
      {
        title: dialogTitle,
        categories: [adminCateringCategoryId, addPostDialog],
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setAddPostDialog(null);
          setDialogTitle("");
          setSelectedPost(data.id);
          setPostData(data);
        },
      }
    );
  };

  const handleUpdatePost = () => {
    if (!userHasCateringRole) return;
    updatePost({
      id: postData.id,
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      featuredMedia: postData.imageId,
      link: postData.link,
      status: "publish",
    });
  };

  const handleDeletePost = () => {
    if (!userHasCateringRole) return;
    deletePost(
      { id: selectedPost },
      {
        onSuccess: () => {
          setDeletePostDialog(false);
        },
      }
    );
  };

  const firstRun = useRef(true);
  useEffect(() => {
    if (posts?.length > 0 && firstRun.current) {
      const firstPost = posts[0];
      setSelectedPost(firstPost.id);
      setPostData(firstPost);
      firstRun.current = false;
    }
  }, [posts]);

  return (
    <Layout>
      <Header title="Catering" />
      <div className="flex items-start gap-10 flex-wrap md:flex-nowrap px-5 md:px-10 pb-6">
        <div>
          {isLoadingPosts ? (
            <div className="flex items-center justify-center py-2">
              <CircularProgress size={24} />
            </div>
          ) : isPostsError ? (
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
          ) : posts.length <= 0 ? (
            <div className="text-gray-500 my-2 px-4">
              Nema informacija za prikaz
            </div>
          ) : (
            [
              cateringPagesCategoryId,
              cateringPonudaHraneCategoryId,
              cateringPonudaPicaCategoryId,
              cateringNajamOpremeCategoryId,
            ]?.map((category) => (
              <Fragment key={category}>
                {category !== cateringPagesCategoryId && (
                  <h3 className="font-semibold mb-2 mt-6">
                    {category === cateringPonudaHraneCategoryId
                      ? "Ponuda hrane"
                      : category === cateringPonudaPicaCategoryId
                      ? "Ponuda pića"
                      : "Najam opreme"}
                  </h3>
                )}
                <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
                  <MenuList>
                    {posts.filter((post) => post.categories.includes(category))
                      ?.length <= 0 ? (
                      <div className="px-4">Nema informacija za prikaz</div>
                    ) : (
                      posts
                        .filter((post) => post.categories.includes(category))
                        ?.map((post) => (
                          <MenuItem
                            key={post.id}
                            selected={selectedPost === post.id}
                            onClick={() => {
                              setSelectedPost(post.id);
                              setPostData(post);
                            }}
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
                {category !== cateringPagesCategoryId && (
                  <LoadingButton
                    className="!mt-2"
                    startIcon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={() => setAddPostDialog(category)}
                  >
                    Dodaj novo
                  </LoadingButton>
                )}
              </Fragment>
            ))
          )}
        </div>
        <div className="flex flex-col items-start gap-4 w-full">
          <div className="w-full">
            <h4 className="uppercase text-sm font-semibold tracking-wide">
              Slika
            </h4>
            <SelectMediaInput
              defaultValue={
                posts?.find((post) => post.id === selectedPost)?.image
              }
              onChange={(imageId) =>
                setPostData((curr) => ({ ...curr, imageId }))
              }
              className="!w-full md:!w-1/2"
              mediaCategoryId={cateringCategoryId}
            />
          </div>

          <div className="w-full">
            <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
              Naslov
            </h4>
            <QuillTextEditor
              value={postData?.title}
              onChange={(title) => setPostData((curr) => ({ ...curr, title }))}
              formats={["bold"]}
              className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
              placeholder="Unesi naslov..."
              useToolbar={false}
            />
          </div>

          {postData.categories?.includes(cateringPagesCategoryId) && (
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Kratki opis
              </h4>
              <QuillTextEditor
                value={postData?.excerpt}
                onChange={(excerpt) =>
                  setPostData((curr) => ({ ...curr, excerpt }))
                }
                useToolbar={false}
                className="[&>div>div]:!min-h-[100px]"
                placeholder="Unesi kratki opis..."
              />
            </div>
          )}

          {postData.categories?.includes(cateringPagesCategoryId) && (
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Sadržaj
              </h4>
              <QuillTextEditor
                value={postData?.content}
                onChange={(content) =>
                  setPostData((curr) => ({ ...curr, content }))
                }
                placeholder="Unesi sadržaj..."
                mediaCategoryId={cateringCategoryId}
              />
            </div>
          )}

          {!postData.categories?.includes(cateringPagesCategoryId) && (
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Saznaj više - poveznica
              </h4>
              <TextField
                variant="outlined"
                label="Poveznica"
                className="w-full"
                value={postData.link || ""}
                onChange={(e) => {
                  setPostData((curr) => ({ ...curr, link: e.target.value }));
                }}
              />
            </div>
          )}

          <div className="flex !gap-4">
            <LoadingButton
              variant="contained"
              className="!bg-primary"
              onClick={handleUpdatePost}
              loading={isUpdating}
            >
              Spremi
            </LoadingButton>
            {!postData.categories?.includes(cateringPagesCategoryId) && (
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

export default PocetnaStranica;

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
  adminEventiCategoryId,
  EVENTI_ROLE,
  eventiCategoryId,
  eventiCateringPostId,
  eventiDvoraneCategoryId,
  eventiPagesCategoryId,
  eventiPocetnaPostId,
  eventiPromotivneUslugeCategoryId,
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
import FeaturesEditor from "../../components/Elements/FeaturesEditor";
import MultiImageSelect from "../../components/Elements/MultiImageSelect";

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

  const userHasEventiRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(EVENTI_ROLE)
      : Object.values(user.data.roles).includes(EVENTI_ROLE));

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({
    categories: adminEventiCategoryId,
  });

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreatePost = () => {
    if (!userHasEventiRole) return;
    if (
      ![eventiDvoraneCategoryId, eventiPromotivneUslugeCategoryId].includes(
        addPostDialog
      )
    )
      return;

    createPost(
      {
        title: dialogTitle,
        categories: [adminEventiCategoryId, addPostDialog],
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
    if (!userHasEventiRole) return;
    updatePost({
      id: postData.id,
      title: postData.title,
      content: postData.content,
      featuredMedia: postData.imageId,
      images: postData.images,
      features: postData.features,
      link: postData.link,
      status: "publish",
    });
  };

  const handleDeletePost = () => {
    if (!userHasEventiRole) return;
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
      <Header title="Najam prostora" />
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
              eventiPagesCategoryId,
              eventiDvoraneCategoryId,
              eventiPromotivneUslugeCategoryId,
            ]?.map((category) => (
              <Fragment key={category}>
                {category !== eventiPagesCategoryId && (
                  <h3 className="font-semibold mb-2 mt-6">
                    {category === eventiDvoraneCategoryId
                      ? "Dvorane"
                      : "Promotivne usluge"}
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
                {category !== eventiPagesCategoryId && (
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
              mediaCategoryId={eventiCategoryId}
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

          {selectedPost !== eventiPocetnaPostId && (
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
                mediaCategoryId={eventiCategoryId}
              />
            </div>
          )}

          {selectedPost === eventiCateringPostId && (
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

          {selectedPost === eventiPocetnaPostId && (
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Značajke
              </h4>
              <FeaturesEditor
                categoryId={eventiCategoryId}
                value={postData.features}
                onChange={(features) =>
                  setPostData((curr) => ({ ...curr, features }))
                }
              />
            </div>
          )}

          {selectedPost === eventiPocetnaPostId && (
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Događanja
              </h4>
              <MultiImageSelect
                categoryId={eventiCategoryId}
                value={postData.images}
                onChange={(images) =>
                  setPostData((curr) => ({ ...curr, images }))
                }
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
            {!postData.categories?.includes(eventiPagesCategoryId) && (
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

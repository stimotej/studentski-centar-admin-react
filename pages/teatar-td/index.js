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
import { LoadingButton } from "@mui/lab";
import dynamic from "next/dynamic";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  adminTeatarTdCategory,
  TEATAR_TD_ROLE,
  teatarTdArchiveCategoryId,
  teatarTdCategoryId,
  teatarTdONamaPost,
  teatarTdPagesCategoryId,
  teatarTdProdajaUlaznicaPost,
} from "../../lib/constants";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";
import { useUser } from "../../features/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import MediaSelectDialog from "../../components/MediaSelectDialog";

const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const PocetnaStranica = () => {
  const [postData, setPostData] = useState({});
  const [addPostDialog, setAddPostDialog] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [deletePostDialog, setDeletePostDialog] = useState(false);
  const [mediaDialog, setMediaDialog] = useState(false);

  const { data: user } = useUser();

  const userHasTeatarTdRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(TEATAR_TD_ROLE)
      : Object.values(user.data.roles).includes(TEATAR_TD_ROLE));

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({
    categories: adminTeatarTdCategory,
  });

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreatePost = () => {
    if (!userHasTeatarTdRole) return;
    if (addPostDialog?.categories?.includes(teatarTdArchiveCategoryId)) return;

    createPost(
      {
        title: dialogTitle,
        categories: [
          adminTeatarTdCategory,
          teatarTdArchiveCategoryId,
          addPostDialog,
        ],
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setAddPostDialog(null);
          setDialogTitle("");
          setPostData(data);
        },
      }
    );
  };

  const handleUpdatePost = () => {
    if (!postData) return;
    if (!userHasTeatarTdRole) return;
    updatePost({
      id: postData.id,
      title: postData.title,
      sadrzaj: postData.sadrzaj,
      excerpt: "<p></p>",
      content: postData.content,
      status: "publish",
      link: postData.link,
      documents:
        postData.documents.length > 0 &&
        postData.documents.map((file) => ({
          id: file.id,
          title: file.title,
          media_type: file.mediaType || file.media_type,
          mime_type: file.mimeType || file.mime_type,
          source_url: file.src || file.source_url,
        })),
      accordionItems: postData.accordionItems,
      ...(postData.imageId ? { featuredMedia: postData.imageId } : {}),
    });
  };

  const handleDeletePost = () => {
    if (!postData) return;
    if (!userHasTeatarTdRole) return;
    deletePost(
      { id: postData.id },
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
      setPostData(firstPost);
      firstRun.current = false;
    }
  }, [posts]);

  return (
    <Layout>
      <Header title="Teatar &TD" />
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
            [teatarTdPagesCategoryId, teatarTdArchiveCategoryId]?.map(
              (category) => (
                <Fragment key={category}>
                  {category === teatarTdArchiveCategoryId && (
                    <h3 className="font-semibold mb-2 mt-6">Arhive</h3>
                  )}
                  <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
                    <MenuList>
                      {posts.filter((post) =>
                        post.categories.includes(category)
                      )?.length <= 0 ? (
                        <div className="px-4">Nema informacija za prikaz</div>
                      ) : (
                        posts
                          .filter((post) => post.categories.includes(category))
                          ?.map((post) => (
                            <MenuItem
                              key={post.id}
                              selected={postData?.id === post.id}
                              onClick={() => {
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
                  {category !== teatarTdPagesCategoryId && (
                    <LoadingButton
                      className="!mt-2"
                      startIcon={<FontAwesomeIcon icon={faPlus} />}
                      onClick={() => setAddPostDialog(category)}
                    >
                      Dodaj novo
                    </LoadingButton>
                  )}
                </Fragment>
              )
            )
          )}
        </div>
        <div className="w-full">
          <div className="flex flex-col items-start gap-4 w-full">
            {postData.id === teatarTdONamaPost && (
              <div className="w-full">
                <h3 className="font-semibold">Slika</h3>
                <SelectMediaInput
                  defaultValue={postData?.image}
                  onChange={(imageId) =>
                    setPostData((curr) => ({ ...curr, imageId }))
                  }
                  className="!w-full md:!w-1/2 !bg-transparent border-gray-200"
                  mediaCategoryId={teatarTdCategoryId}
                />
              </div>
            )}
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Naslov
              </h4>
              <QuillTextEditor
                value={postData?.title}
                onChange={(title) =>
                  setPostData((curr) => ({ ...curr, title }))
                }
                formats={["bold"]}
                className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
                placeholder="Unesi naslov..."
                useToolbar={false}
              />
            </div>
            {postData?.categories?.includes(teatarTdPagesCategoryId) && (
              <div className="w-full">
                <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                  Kratki opis
                </h4>
                <QuillTextEditor
                  value={postData?.sadrzaj}
                  onChange={(sadrzaj) =>
                    setPostData((curr) => ({ ...curr, sadrzaj }))
                  }
                  className="[&>div>div]:!min-h-[100px]"
                  placeholder="Unesi kratki opis..."
                  mediaCategoryId={teatarTdCategoryId}
                />
              </div>
            )}
            {postData?.categories?.includes(teatarTdPagesCategoryId) &&
              postData?.id === teatarTdProdajaUlaznicaPost && (
                <div className="w-full">
                  <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                    Padajući izbornici
                  </h4>
                  <div className="space-y-2 mb-2">
                    {postData?.accordionItems?.map((accordionItem, index) => (
                      <div key={index} className="p-2 border rounded-md">
                        <input
                          type="text"
                          value={accordionItem.title}
                          onChange={(e) => {
                            setPostData((curr) => ({
                              ...curr,
                              accordionItems: curr.accordionItems.map(
                                (item, i) =>
                                  i === index
                                    ? { ...item, title: e.target.value }
                                    : item
                              ),
                            }));
                          }}
                          className="font-medium text-sm mb-2 border rounded bg-transparent w-full"
                          placeholder="Naslov"
                        />
                        <textarea
                          rows={3}
                          value={accordionItem.description}
                          onChange={(e) => {
                            setPostData((curr) => ({
                              ...curr,
                              accordionItems: curr.accordionItems.map(
                                (item, i) =>
                                  i === index
                                    ? { ...item, description: e.target.value }
                                    : item
                              ),
                            }));
                          }}
                          className="font-medium text-sm border rounded bg-transparent w-full"
                          placeholder="Opis"
                        />
                        <LoadingButton
                          color="error"
                          className="mt-2"
                          onClick={() => {
                            setPostData((curr) => ({
                              ...curr,
                              accordionItems: curr.accordionItems.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                        >
                          Obriši
                        </LoadingButton>
                      </div>
                    ))}
                  </div>
                  <LoadingButton
                    variant="outlined"
                    onClick={() => {
                      setPostData((curr) => ({
                        ...curr,
                        accordionItems: [
                          ...curr.accordionItems,
                          { title: "", description: "" },
                        ],
                      }));
                    }}
                  >
                    Dodaj padajući izbornik
                  </LoadingButton>
                </div>
              )}
            {postData?.categories?.includes(teatarTdPagesCategoryId) && (
              <div className="w-full">
                <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                  Sadržaj
                </h4>
                <QuillTextEditor
                  value={postData?.content}
                  onChange={(content) =>
                    setPostData((curr) => ({ ...curr, content }))
                  }
                  files={postData.documents}
                  mediaCategoryId={teatarTdCategoryId}
                  setFiles={(documents) =>
                    setPostData((curr) => ({ ...curr, documents }))
                  }
                  placeholder="Unesi sadržaj..."
                />
              </div>
            )}
            {postData?.categories?.includes(teatarTdArchiveCategoryId) && (
              <div className="w-full">
                <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                  Poveznica na Word dokument
                </h4>
                <TextField
                  variant="outlined"
                  label="Poveznica"
                  className="w-full"
                  value={postData.link || ""}
                  helperText="Ako je poveznica na dokument definirana, događaji se neće prikazivati pod ovim padajućim izbornikom. Umjesto toga, bit će vidljiv pregled dokumenta."
                  onChange={(e) => {
                    setPostData((curr) => ({
                      ...curr,
                      link: e.target.value,
                    }));
                  }}
                />
                <Button className="!mt-4" onClick={() => setMediaDialog(true)}>
                  Odaberi datoteku
                </Button>
                {!!postData.link && (
                  <>
                    <h4 className="uppercase text-sm font-semibold tracking-wide mb-2 mt-6">
                      Pregled
                    </h4>
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${postData.link}`}
                      className="w-full h-[60rem]"
                    />
                  </>
                )}
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
              {!postData.categories?.includes(teatarTdPagesCategoryId) && (
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

      <MediaSelectDialog
        opened={mediaDialog}
        onClose={() => setMediaDialog(false)}
        onSelect={(value) =>
          value && setPostData((curr) => ({ ...curr, link: value.src }))
        }
        categoryId={teatarTdCategoryId}
        mediaType="application"
      />

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

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
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
  adminTurizamCategoryId,
  TURIZAM_ROLE,
  turizamCategoryId,
  turizamCjenikCategoryId,
  turizamCjenikPostId,
  turizamPagesCategoryId,
  turizamPocetnaPostId,
  turizamSmjestajCategoryId,
  turizamSmjestajPostId,
} from "../../lib/constants";
import { LoadingButton } from "@mui/lab";
import { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  faPlus,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";
import Image from "next/image";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import clsx from "clsx";
import EditLocation from "../../components/Elements/EditLocation";
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
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const { data: user } = useUser();

  const userHasTurizamRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(TURIZAM_ROLE)
      : Object.values(user.data.roles).includes(TURIZAM_ROLE));

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({
    categories: adminTurizamCategoryId,
  });

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreatePost = () => {
    if (!userHasTurizamRole) return;
    if (
      ![turizamSmjestajCategoryId, turizamCjenikCategoryId].includes(
        addPostDialog
      )
    )
      return;

    createPost(
      {
        title: dialogTitle,
        categories: [adminTurizamCategoryId, addPostDialog],
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setAddPostDialog(null);
          setDialogTitle("");
          setSelectedPost(data.id);
        },
      }
    );
  };

  const handleUpdatePost = () => {
    if (!userHasTurizamRole) return;
    updatePost({
      id: postData.id,
      title: postData.title,
      excerpt: postData.excerpt,
      content: postData.content,
      featuredMedia: postData.imageId,
      images: postData.images,
      rentalOptions: postData.rentalOptions,
      lokacija: postData.lokacija,
      status: "publish",
    });
  };

  const handleDeletePost = () => {
    if (!userHasTurizamRole) return;
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
      <Header title="Turizam" />
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
              turizamPagesCategoryId,
              turizamSmjestajCategoryId,
              turizamCjenikCategoryId,
            ]?.map((category) => (
              <Fragment key={category}>
                {category !== turizamPagesCategoryId && (
                  <h3 className="font-semibold mb-2 mt-6">
                    {category === turizamSmjestajCategoryId
                      ? "Smjestaj"
                      : "Cjenik"}
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
                {category !== turizamPagesCategoryId && (
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
          {(postData.categories?.includes(turizamSmjestajCategoryId) ||
            selectedPost === turizamPocetnaPostId) && (
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
                mediaCategoryId={turizamCategoryId}
              />
            </div>
          )}
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

          {!postData.categories?.includes(turizamSmjestajCategoryId) &&
            ![turizamSmjestajPostId, turizamCjenikPostId].includes(
              selectedPost
            ) && (
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
          {!postData.categories?.includes(turizamCjenikCategoryId) &&
            selectedPost !== turizamSmjestajPostId && (
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
                />
              </div>
            )}
          {(postData.categories?.includes(turizamSmjestajCategoryId) ||
            selectedPost === turizamPocetnaPostId) && (
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Slike
              </h4>
              <div className="bg-secondary border border-gray-400 rounded-lg w-full p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {postData.images &&
                    Array.isArray(postData.images) &&
                    postData.images.length > 0 &&
                    postData.images.map((imageSrc, index) => (
                      <div key={index} className="relative">
                        <Tooltip title="Ukloni sliku" arrow>
                          <button
                            className="absolute top-0 right-0 z-10 peer px-2 py-1 opacity-0 hover:opacity-100 transition-opacity duration-200"
                            size="small"
                            onClick={() => {
                              setPostData((curr) => ({
                                ...curr,
                                images: curr.images.filter(
                                  (_, i) => i !== index
                                ),
                              }));
                            }}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </Tooltip>
                        <div className="absolute inset-0 peer-hover:bg-gradient-to-bl from-white/80 to-transparent" />
                        <Image
                          src={imageSrc}
                          alt="Studentski dom"
                          width={96}
                          height={96}
                          className="w-full h-auto aspect-square object-cover bg-gray-100 rounded-sm"
                        />
                      </div>
                    ))}
                  <button
                    className="w-full h-auto aspect-square flex flex-col items-center justify-center gap-2 rounded-sm border border-gray-600 hover:bg-gray-100 text-gray-600 border-dashed"
                    onClick={() => setMediaDialogOpen(true)}
                  >
                    <FontAwesomeIcon icon={faAdd} />
                    <span className="text-xs">Dodaj sliku</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {postData.categories?.includes(turizamCjenikCategoryId) && (
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide !mb-2">
                Opcije najma
              </h4>
              <div className="bg-secondary border border-gray-400 rounded-lg w-full p-4">
                {postData.rentalOptions?.map((option, index) => (
                  <div key={index}>
                    {index !== 0 && <Divider className="!my-6" />}
                    <TextField
                      variant="outlined"
                      label="Naziv opcije"
                      className="w-full"
                      value={option.title || ""}
                      onChange={(e) => {
                        setPostData((curr) => ({
                          ...curr,
                          rentalOptions: curr.rentalOptions.map((o, i) =>
                            i === index ? { ...o, title: e.target.value } : o
                          ),
                        }));
                      }}
                    />
                    <TextField
                      variant="outlined"
                      label="Podnaslov opcije"
                      className="w-full !mt-3"
                      value={option.subtitle || ""}
                      onChange={(e) => {
                        setPostData((curr) => ({
                          ...curr,
                          rentalOptions: curr.rentalOptions.map((o, i) =>
                            i === index ? { ...o, subtitle: e.target.value } : o
                          ),
                        }));
                      }}
                    />
                    <p className="text-sm font-medium !mb-2 !mt-3">Cijene</p>
                    <div>
                      {option.items?.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className={clsx(
                            // "pl-4 border-l-2 border-primary",
                            "border border-gray-400 p-4 rounded-lg",
                            itemIndex !== 0 && "!mt-4"
                          )}
                        >
                          <TextField
                            variant="outlined"
                            label="Naslov"
                            className="w-full"
                            value={item.title || ""}
                            onChange={(e) => {
                              setPostData((curr) => ({
                                ...curr,
                                rentalOptions: curr.rentalOptions.map((o, i) =>
                                  i === index
                                    ? {
                                        ...o,
                                        items: o.items.map((_item, j) =>
                                          j === itemIndex
                                            ? {
                                                ..._item,
                                                title: e.target.value,
                                              }
                                            : _item
                                        ),
                                      }
                                    : o
                                ),
                              }));
                            }}
                          />
                          <TextField
                            variant="outlined"
                            label="Cijena"
                            className="w-full !mt-3"
                            value={item.price || ""}
                            onChange={(e) => {
                              setPostData((curr) => ({
                                ...curr,
                                rentalOptions: curr.rentalOptions.map((o, i) =>
                                  i === index
                                    ? {
                                        ...o,
                                        items: o.items.map((_item, j) =>
                                          j === itemIndex
                                            ? {
                                                ..._item,
                                                price: e.target.value,
                                              }
                                            : _item
                                        ),
                                      }
                                    : o
                                ),
                              }));
                            }}
                          />
                          <Button
                            className="!mt-3"
                            color="error"
                            onClick={() => {
                              setPostData((curr) => ({
                                ...curr,
                                rentalOptions: curr.rentalOptions.map((o, i) =>
                                  i === index
                                    ? {
                                        ...o,
                                        items: o.items.filter(
                                          (_, j) => j !== itemIndex
                                        ),
                                      }
                                    : o
                                ),
                              }));
                            }}
                          >
                            Ukloni
                          </Button>
                        </div>
                      ))}

                      <Button
                        className="!mt-3"
                        onClick={() => {
                          setPostData((curr) => ({
                            ...curr,
                            rentalOptions: curr.rentalOptions.map((o, i) =>
                              i === index
                                ? {
                                    ...o,
                                    items: [
                                      ...o.items,
                                      {
                                        title: "",
                                        price: "",
                                      },
                                    ],
                                  }
                                : o
                            ),
                          }));
                        }}
                      >
                        Dodaj cijenu
                      </Button>
                    </div>
                  </div>
                ))}
                <LoadingButton
                  variant="outlined"
                  className="!mt-3"
                  onClick={() => {
                    setPostData((curr) => ({
                      ...curr,
                      rentalOptions: [
                        ...curr.rentalOptions,
                        {
                          title: "",
                          subtitle: "",
                          items: [
                            {
                              title: "",
                              price: "",
                            },
                          ],
                        },
                      ],
                    }));
                  }}
                >
                  Dodaj opciju
                </LoadingButton>
              </div>
            </div>
          )}

          {postData.categories?.includes(turizamSmjestajCategoryId) && (
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide !mb-2">
                Lokacija
              </h4>
              <EditLocation
                value={postData.lokacija}
                onChange={(value) =>
                  setPostData({ ...postData, lokacija: value })
                }
                defaultHeight={350}
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
            {!postData.categories?.includes(turizamPagesCategoryId) && (
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

      <MediaSelectDialog
        opened={mediaDialogOpen}
        onClose={() => setMediaDialogOpen(false)}
        onSelect={(media) => {
          setPostData((curr) => ({
            ...curr,
            images: [...(curr.images ?? []), media.src],
          }));
        }}
        categoryId={turizamCategoryId}
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

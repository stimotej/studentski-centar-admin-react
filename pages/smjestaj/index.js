import Header from "../../components/Header";
import Layout from "../../components/Layout";
import React, { useEffect, useState } from "react";
import { adminSmjestajCategory, smjestajCategoryId } from "../../lib/constants";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import { LoadingButton } from "@mui/lab";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";
import ReorderImages from "../../components/Elements/ReorderImages";
import EditLocation from "../../components/Elements/EditLocation";
import {
  useAdminCategories,
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "../../features/posts";
import dynamic from "next/dynamic";
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
    parent: adminSmjestajCategory,
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
      categories: adminSmjestajCategory,
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
  const [sadrzaj, setSadrzaj] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [radnoVrijemeBlagajni, setRadnoVrijemeBlagajni] = useState("");
  const [lokacija, setLokacija] = useState("");
  const [imageGroups, setImageGroups] = useState([]);

  useEffect(() => {
    if (posts) {
      const dormitory = posts.find((d) => d.id === page) || posts?.[0];
      const categoryId =
        categories?.find((c) => dormitory.categories.includes(c.id))?.id ||
        categories?.[0]?.id;
      if (!dormitory) return;
      setPage(dormitory.id);
      setCategory(categoryId);
      setImage(dormitory.imageId);
      setTitle(dormitory.title);
      setExcerpt(dormitory.excerpt);
      setContent(dormitory.content);
      setSadrzaj(dormitory.sadrzaj);
      setRadnoVrijemeBlagajni(dormitory.radno_vrijeme_blagajni);
      setKontakt(dormitory.kontakt);
      setLokacija(dormitory.lokacija);
      setImageGroups(dormitory.image_groups || []);
    }
  }, [posts, categories]);

  const handleSelectPage = (dormitoryId, categoryId) => {
    const dormitory = posts.find((d) => d.id === dormitoryId);
    if (!dormitory) return;
    setPage(dormitoryId);
    setCategory(categoryId);
    setImage(dormitory.imageId);
    setTitle(dormitory.title);
    setExcerpt(dormitory.excerpt);
    setContent(dormitory.content);
    setSadrzaj(dormitory.sadrzaj);
    setKontakt(dormitory.kontakt);
    setRadnoVrijemeBlagajni(dormitory.radno_vrijeme_blagajni);
    setLokacija(dormitory.lokacija);
    setImageGroups(dormitory.image_groups || []);
  };

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreateDormitory = () => {
    createPost(
      {
        title: dialogTitle,
        categories: [adminSmjestajCategory, category],
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

  const handleUpdateDormitory = () => {
    const dormitory = posts.find((d) => d.id === page);
    updatePost(
      {
        id: page,
        title: title,
        excerpt: excerpt,
        content: content,
        sadrzaj: sadrzaj,
        kontakt: kontakt,
        radno_vrijeme_blagajni: radnoVrijemeBlagajni,
        lokacija: lokacija !== dormitory.lokacija ? lokacija : undefined,
        image_groups: imageGroups,
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
                    Dodaj novi
                  </LoadingButton>
                </div>
              ))
            )}
          </div>
          <div className="flex-1">
            {categories?.find((post) => post.id === category)?.slug ===
              "studentski-dom" && (
              <>
                <h3 className="font-semibold">Slika</h3>
                <SelectMediaInput
                  defaultValue={posts?.find((d) => d.id === page)?.image}
                  onChange={setImage}
                  className="md:!w-1/2 !w-full !bg-transparent border-gray-200"
                  mediaCategoryId={smjestajCategoryId}
                />
              </>
            )}
            <h3 className="font-semibold mt-4 mb-2">Naziv</h3>
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
              mediaCategoryId={smjestajCategoryId}
            />

            {categories?.find((post) => post.id === category)?.slug ===
            "studentski-dom" ? (
              <>
                <h3 className="font-semibold mt-4 mb-2">Sadržaj</h3>
                <QuillTextEditor
                  value={sadrzaj}
                  onChange={setSadrzaj}
                  placeholder="Unesi sadržaj..."
                  mediaCategoryId={smjestajCategoryId}
                />

                <h3 className="font-semibold mt-4 mb-2">Kontakt</h3>
                <QuillTextEditor
                  value={kontakt}
                  onChange={setKontakt}
                  placeholder="Unesi kontakt..."
                  mediaCategoryId={smjestajCategoryId}
                />

                <h3 className="font-semibold mt-4 mb-2">
                  Radno vrijeme blagajni
                </h3>
                <QuillTextEditor
                  value={radnoVrijemeBlagajni}
                  onChange={setRadnoVrijemeBlagajni}
                  placeholder="Unesi radno vrijeme blagajni..."
                  mediaCategoryId={smjestajCategoryId}
                />

                <h3 className="font-semibold mt-4 mb-2">Grupe slika</h3>
                <ReorderImages
                  imageGroups={imageGroups}
                  setImageGroups={setImageGroups}
                  mediaCategoryId={smjestajCategoryId}
                />

                <h3 className="font-semibold mt-4 mb-2">Lokacija</h3>
                <EditLocation value={lokacija} onChange={setLokacija} />
              </>
            ) : (
              <>
                <h3 className="font-semibold mt-4 mb-2">Sadržaj</h3>
                <QuillTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Unesi sadržaj..."
                  mediaCategoryId={smjestajCategoryId}
                />
              </>
            )}

            <div className="flex gap-2 items-center mt-6">
              <LoadingButton
                variant="contained"
                loading={isUpdating}
                onClick={handleUpdateDormitory}
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
        <DialogTitle>Brisanje doma</DialogTitle>
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
        <DialogTitle>Dodaj novi</DialogTitle>
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

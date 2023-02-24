import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import {
  adminSmjestajCategory,
  smjestajCategoryId,
  userGroups,
} from "../../lib/constants";
import React, { useRouter } from "next/router";
import dynamic from "next/dynamic";
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
import {
  useCreateDormitory,
  useDeleteDormitory,
  useDormitories,
  useUpdateDormitory,
} from "../../features/dormitories";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";
import { useMemo } from "react";
import ReorderImages from "../../components/Elements/ReorderImages";
import EditLocation from "../../components/Elements/EditLocation";
import { useAdminCategories, usePosts } from "../../features/posts";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Home = () => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useAdminCategories(
    {
      parent: adminSmjestajCategory,
    },
    {
      onSuccess: (data) => {
        console.log("categories", data);
      },
      onError: (error) => {
        console.log("categories error", error.response);
      },
      onSettled: (error) => {
        console.log("categories error setlled", error);
      },
    }
  );
  console.log("categoriescategories", categories);

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
  const [sadrzaj, setSadrzaj] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [lokacija, setLokacija] = useState("");
  const [imageGroups, setImageGroups] = useState([]);

  useEffect(() => {
    if (posts) {
      const dormitory = posts.find((d) => d.id === page) || posts?.[0];
      if (!dormitory) return;
      setPage(dormitory.id);
      setImage(dormitory.imageId);
      setTitle(dormitory.title);
      setExcerpt(dormitory.excerpt);
      setSadrzaj(dormitory.sadrzaj);
      setKontakt(dormitory.kontakt);
      setLokacija(dormitory.lokacija);
      setImageGroups(dormitory.image_groups || []);
    }
  }, [posts]);

  const handleSelectPage = (dormitoryId) => {
    const dormitory = posts.find((d) => d.id === dormitoryId);
    if (!dormitory) return;
    setPage(dormitory.id);
    setImage(dormitory.imageId);
    setTitle(dormitory.title);
    setExcerpt(dormitory.excerpt);
    setSadrzaj(dormitory.sadrzaj);
    setKontakt(dormitory.kontakt);
    setLokacija(dormitory.lokacija);
    setImageGroups(dormitory.image_groups || []);
  };

  const quillModules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["link"],
        [
          { align: "" },
          { align: "center" },
          { align: "right" },
          { align: "justify" },
        ],
      ],
    }),
    []
  );

  const { mutate: createDormitory, isLoading: isCreating } =
    useCreateDormitory();
  const { mutate: updateDormitory, isLoading: isUpdating } =
    useUpdateDormitory();
  const { mutate: deleteDormitory, isLoading: isDeleting } =
    useDeleteDormitory();

  const handleCreateDormitory = () => {
    createDormitory(
      {
        title: dialogTitle,
      },
      {
        onSuccess: (data) => {
          setAddPostDialog(false);
          setDialogTitle("");
          setPage(data.id);
        },
      }
    );
  };

  const handleUpdateDormitory = () => {
    updateDormitory(
      {
        id: page,
        title: title,
        excerpt: excerpt,
        sadrzaj: sadrzaj,
        kontakt: kontakt,
        lokacija: lokacija,
        image_groups: imageGroups,
        ...(image ? { imageId: image } : {}),
      },
      {
        onError: (err) => {
          console.log("err", err.response.data);
        },
      }
    );
  };

  const handleDeleteDormitory = () => {
    deleteDormitory(
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
              <div className="text-error my-2 px-4">
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
                <React.Fragment key={category.id}>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
                    <MenuList>
                      {posts?.map((post) => (
                        <MenuItem
                          key={post.id}
                          selected={page === post.id}
                          onClick={() => handleSelectPage(post.id)}
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
                            <ReactQuill
                              value={post.title}
                              className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1 [&>div>div>p]:hover:cursor-pointer"
                              modules={{ toolbar: false }}
                              readOnly
                            />
                          </ListItemText>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Paper>
                </React.Fragment>
              ))
            )}

            <LoadingButton
              className="mt-2"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => setAddPostDialog(true)}
            >
              Dodaj novi
            </LoadingButton>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Slika</h3>
            <SelectMediaInput
              defaultValue={posts?.find((d) => d.id === page)?.image}
              onChange={setImage}
              className="w-1/2 !bg-transparent border-gray-200"
              mediaCategoryId={smjestajCategoryId}
            />
            <h3 className="font-semibold mt-4 mb-2">Naziv</h3>
            <ReactQuill
              value={title}
              onChange={setTitle}
              className="border rounded-lg obavijest-title font-semibold"
              formats={["header"]}
              placeholder="Unesi naslov..."
              modules={{
                toolbar: false,
              }}
            />
            <h3 className="font-semibold mt-4 mb-2">Opis</h3>
            <ReactQuill
              value={excerpt}
              onChange={setExcerpt}
              className="border rounded-lg [&>div>div]:border-t [&>div>div]:border-gray-200"
              placeholder="Unesi opis..."
              modules={quillModules}
            />
            <h3 className="font-semibold mt-4 mb-2">Sadržaj</h3>
            <ReactQuill
              value={sadrzaj}
              onChange={setSadrzaj}
              className="border rounded-lg [&>div>div]:border-t [&>div>div]:border-gray-200"
              placeholder="Unesi sadržaj..."
              modules={quillModules}
            />
            <h3 className="font-semibold mt-4 mb-2">Kontakt</h3>
            <ReactQuill
              value={kontakt}
              onChange={setKontakt}
              className="border rounded-lg [&>div>div]:border-t [&>div>div]:border-gray-200"
              placeholder="Unesi kontakt..."
              modules={quillModules}
            />

            <h3 className="font-semibold mt-4 mb-2">Grupe slika</h3>
            <ReorderImages
              imageGroups={imageGroups}
              setImageGroups={setImageGroups}
              mediaCategoryId={smjestajCategoryId}
            />

            <h3 className="font-semibold mt-4 mb-2">Lokacija</h3>
            <EditLocation value={lokacija} onChange={setLokacija} />

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
        <DialogTitle>Dodaj dom</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bit će vidljivo na stranici tek nakon što uredite sadržaj i spremite
            promjene.
          </DialogContentText>
          <ReactQuill
            value={dialogTitle}
            onChange={setDialogTitle}
            className="mt-2 border rounded-lg"
            placeholder="Naslov"
            modules={{
              toolbar: false,
            }}
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

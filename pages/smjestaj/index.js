import Header from "../../components/Header";
import PrikazRestorana from "../../components/Prehrana/PrikazRestorana";
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import { smjestajCategoryId, userGroups } from "../../lib/constants";
import { useRouter } from "next/router";
import { useCreateRestaurant, useRestaurants } from "../../features/restaurant";
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
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Home = () => {
  const {
    data: dormitories,
    isLoading: isLoadingDormitories,
    isError: isDormitoriesError,
    refetch: refetchDormitories,
    isRefetching: isRefetchingDormitories,
  } = useDormitories();

  const router = useRouter();

  const [page, setPage] = useState(0);
  const [addDormitoryDialog, setAddDormitoryDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  const [deleteDormitoryDialog, setDeleteDormitoryDialog] = useState(false);

  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const dormitory = dormitories?.find((d) => d.id === page);

  useEffect(() => {
    if (dormitories) {
      const dormitory =
        dormitories.find((d) => d.id === page) || dormitories?.[0];
      if (!dormitory) return;
      setPage(dormitory.id);
      setImage(dormitory.imageId);
      setTitle(dormitory.title);
      setExcerpt(dormitory.excerpt);
    }
  }, [dormitories, page]);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["smjestaj"].includes(username))
      router.push("/smjestaj/login");
  }, [router]);

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
          setAddDormitoryDialog(false);
          setDialogTitle("");
          setPage(data.id);
        },
      }
    );
  };

  const handleUpdateDormitory = () => {
    updateDormitory({
      id: page,
      title: title,
      excerpt: excerpt,
      ...(image ? { imageId: image } : {}),
    });
  };

  const handleDeleteDormitory = () => {
    deleteDormitory(
      {
        id: page,
      },
      {
        onSuccess: () => {
          setDeleteDormitoryDialog(false);
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
            <h3 className="font-semibold mb-2">Domovi</h3>
            <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
              <MenuList>
                {isLoadingDormitories ? (
                  <div className="flex items-center justify-center py-2">
                    <CircularProgress size={24} />
                  </div>
                ) : isDormitoriesError ? (
                  <div className="text-error my-2 px-4">
                    Greška kod učitavanja
                    <LoadingButton
                      variant="outlined"
                      className="mt-4"
                      onClick={() => refetchDormitories()}
                      loading={isRefetchingDormitories}
                    >
                      Pokušaj ponovno
                    </LoadingButton>
                  </div>
                ) : dormitories.length <= 0 ? (
                  <div className="text-gray-500 my-2 px-4">
                    Nema domova za prikaz
                  </div>
                ) : (
                  dormitories?.map((dormitory) => (
                    <MenuItem
                      key={dormitory.id}
                      selected={page === dormitory.id}
                      onClick={() => setPage(dormitory.id)}
                    >
                      {dormitory.status === "draft" && (
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
                        <ReactQuill
                          value={dormitory.title}
                          className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1 [&>div>div>p]:hover:cursor-pointer"
                          modules={{ toolbar: false }}
                          readOnly
                        />
                      </ListItemText>
                    </MenuItem>
                  ))
                )}
              </MenuList>
            </Paper>
            <LoadingButton
              className="mt-2"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => setAddDormitoryDialog(true)}
            >
              Dodaj novi
            </LoadingButton>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Slika</h3>
            <SelectMediaInput
              defaultValue={dormitory?.image}
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
              modules={{
                toolbar: [
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ color: [] }, { background: [] }],
                  [
                    { align: "" },
                    { align: "center" },
                    { align: "right" },
                    { align: "justify" },
                  ],
                ],
              }}
            />
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
                onClick={() => setDeleteDormitoryDialog(true)}
              >
                Obriši
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={deleteDormitoryDialog}
        onClose={() => setDeleteDormitoryDialog(false)}
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
            onClick={() => setDeleteDormitoryDialog(false)}
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
        open={!!addDormitoryDialog}
        onClose={() => {
          setAddDormitoryDialog(null);
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
              setAddDormitoryDialog(null);
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

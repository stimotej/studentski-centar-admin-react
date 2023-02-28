import Header from "../../components/Header";
import PrikazRestorana from "../../components/Prehrana/PrikazRestorana";
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
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
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Home = () => {
  const {
    data: restaurants,
    isLoading: isLoadingRestaurants,
    isError: isRestaurantsError,
    refetch: refetchRestaurants,
    isRefetching: isRefetchingRestaurants,
  } = useRestaurants();

  const [page, setPage] = useState(0);
  const [addRestaurantDialog, setAddRestaurantDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  const restaurant = restaurants?.find((r) => r.id === page);

  useEffect(() => {
    if (restaurants) {
      if (page !== 0) return;
      setPage(restaurants[0].id);
    }
  }, [restaurants]);

  const { mutate: createRestaurant, isLoading: isCreating } =
    useCreateRestaurant();

  const handleCreateRestaurant = () => {
    createRestaurant(
      {
        title: dialogTitle,
      },
      {
        onSuccess: (data) => {
          setAddRestaurantDialog(false);
          setDialogTitle("");
          setPage(data.id);
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
            <h3 className="font-semibold mb-2">Restorani</h3>
            <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
              <MenuList>
                {isLoadingRestaurants ? (
                  <div className="flex items-center justify-center py-2">
                    <CircularProgress size={24} />
                  </div>
                ) : isRestaurantsError ? (
                  <div className="text-error my-2 px-4">
                    Greška kod učitavanja
                    <LoadingButton
                      variant="outlined"
                      className="mt-4"
                      onClick={() => refetchRestaurants()}
                      loading={isRefetchingRestaurants}
                    >
                      Pokušaj ponovno
                    </LoadingButton>
                  </div>
                ) : restaurants.length <= 0 ? (
                  <div className="text-gray-500 my-2 px-4">
                    Nema restorana za prikaz
                  </div>
                ) : (
                  restaurants?.map((restaurant) => (
                    <MenuItem
                      key={restaurant.id}
                      selected={page === restaurant.id}
                      onClick={() => setPage(restaurant.id)}
                    >
                      {restaurant.status === "draft" && (
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
                          value={restaurant.title}
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
              onClick={() => setAddRestaurantDialog(true)}
            >
              Dodaj novi
            </LoadingButton>
          </div>
          <div className="flex-1">
            <PrikazRestorana
              restaurant={restaurant}
              page={page}
              setPage={setPage}
            />
          </div>
        </div>
      </div>

      <Dialog
        open={!!addRestaurantDialog}
        onClose={() => {
          setAddRestaurantDialog(null);
          setDialogTitle("");
        }}
      >
        <DialogTitle>Dodaj restoran</DialogTitle>
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
            formats={[]}
            modules={{
              toolbar: false,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddRestaurantDialog(null);
              setDialogTitle("");
            }}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton onClick={handleCreateRestaurant} loading={isCreating}>
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Home;

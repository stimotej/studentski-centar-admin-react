import Header from "../../components/Header";
import PrikazRestorana from "../../components/Prehrana/PrikazRestorana";
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";
import { useCreateRestaurant, useRestaurants } from "../../features/restaurant";
import { usePosts, useUpdatePost } from "../../features/posts";
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
import { faPlus } from "@fortawesome/pro-regular-svg-icons";
import { LoadingButton } from "@mui/lab";
import DraggableMenuItems from "../../components/Prehrana/DraggableMenuItems";
import { prehranaCategoryId, prehranaLinksPostId } from "../../lib/constants";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const Home = () => {
  const {
    data: restaurants,
    isLoading: isLoadingRestaurants,
    isError: isRestaurantsError,
    refetch: refetchRestaurants,
    isRefetching: isRefetchingRestaurants,
  } = useRestaurants();

  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isPostsError,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts,
  } = usePosts({
    include: [prehranaLinksPostId],
  });

  const [page, setPage] = useState(0);
  const [addRestaurantDialog, setAddRestaurantDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  const [excerpt, setExcerpt] = useState("");

  const restaurant = restaurants?.find((r) => r.id === page);

  useEffect(() => {
    if (restaurants) {
      if (page !== 0) return;
      setPage(restaurants[0].id);
    }
  }, [restaurants]);

  useEffect(() => {
    if (posts) {
      const post = posts.find((p) => p.id === page);
      if (!post) return;
      setExcerpt(post?.excerpt);
    }
  }, [posts, page]);

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

  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();

  const handleUpdatePost = () => {
    updatePost(
      {
        id: page,
        excerpt: excerpt,
        status: "publish",
      },
      {
        onError: () => {},
      }
    );
  };

  return (
    <Layout>
      <Header title="Početna" />
      <div className="px-5 md:px-10 pb-6">
        <div className="flex gap-10 flex-wrap md:flex-nowrap">
          <div>
            <Paper className="md:!min-w-[260px] md:!max-w-[400px] mb-6">
              <MenuList>
                {isLoadingPosts ? (
                  <div className="flex items-center justify-center py-2">
                    <CircularProgress size={24} />
                  </div>
                ) : isPostsError ? (
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
                ) : posts.length <= 0 ? (
                  <div className="text-gray-500 my-2 px-4">
                    Nema informacija za prikaz
                  </div>
                ) : (
                  posts?.map((post) => (
                    <MenuItem
                      key={post.id}
                      selected={page === post.id}
                      onClick={() => setPage(post.id)}
                    >
                      {post.status === "draft" && (
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
                  <DraggableMenuItems
                    items={restaurants}
                    value={page}
                    onChange={setPage}
                  />
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
            {page === prehranaLinksPostId ? (
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Sadržaj</h3>
                <QuillTextEditor
                  value={excerpt}
                  onChange={setExcerpt}
                  placeholder="Unesi opis..."
                  mediaCategoryId={prehranaCategoryId}
                />
                <LoadingButton
                  variant="contained"
                  loading={isUpdating}
                  onClick={handleUpdatePost}
                  className="!bg-primary !mt-4"
                >
                  Spremi
                </LoadingButton>
              </div>
            ) : (
              <PrikazRestorana
                restaurant={restaurant}
                page={page}
                setPage={setPage}
              />
            )}
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
          <QuillTextEditor
            value={dialogTitle}
            onChange={setDialogTitle}
            formats={[]}
            containerClassName="mt-2"
            className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
            placeholder="Naslov"
            useToolbar={false}
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

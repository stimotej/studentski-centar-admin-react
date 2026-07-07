import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { CircularProgress, MenuList, Paper } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DraggableMenuItems from "../../components/Prehrana/DraggableMenuItems";
import { useUser } from "../../features/auth";
import { useSliderObavijesti } from "../../features/obavijesti";
import { ItemTypesDnD, SLIDER_EDITOR_ROLE } from "../../lib/constants";

const SliderPage = () => {
  const { data: user } = useUser();

  const userHasSliderRole =
    !!user?.data?.roles &&
    (Array.isArray(user.data.roles)
      ? user.data.roles.includes(SLIDER_EDITOR_ROLE)
      : Object.values(user.data.roles).includes(SLIDER_EDITOR_ROLE));

  const {
    data: sliderObavijesti,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useSliderObavijesti({ enabled: userHasSliderRole });

  return (
    <Layout>
      <Header title="Slider" />
      <div className="px-5 md:px-10 pb-6">
        {!userHasSliderRole ? (
          <div className="text-gray-500 my-2 px-4">
            Nemate dopuštenje za uređivanje redoslijeda slidera.
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-4 px-1">
              Povucite obavijesti kako biste promijenili redoslijed prikaza na
              slideru na naslovnici.
            </p>
            <Paper className="md:!min-w-[260px] md:!max-w-[500px]">
              <MenuList>
                {isLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <CircularProgress size={24} />
                  </div>
                ) : isError ? (
                  <div className="text-error my-2 px-4">
                    Greška kod učitavanja
                    <LoadingButton
                      variant="outlined"
                      className="mt-4"
                      onClick={() => refetch()}
                      loading={isRefetching}
                    >
                      Pokušaj ponovno
                    </LoadingButton>
                  </div>
                ) : sliderObavijesti?.length <= 0 ? (
                  <div className="text-gray-500 my-2 px-4">
                    Nema obavijesti na slideru
                  </div>
                ) : (
                  <DraggableMenuItems
                    items={sliderObavijesti}
                    value={null}
                    onChange={() => {}}
                    dndType={ItemTypesDnD.SLIDER}
                    endpoint="obavijesti"
                  />
                )}
              </MenuList>
            </Paper>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SliderPage;

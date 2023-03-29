import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MenuSelect from "../../components/Prehrana/MenuSelect";
import AutosuggestInput from "../../components/Elements/AutosuggestInput";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import DateInput from "../../components/Elements/DateInput";
import Layout from "../../components/Layout";
import {
  useCreateMenu,
  useDeleteMenu,
  useMenusByDate,
  useUpdateMenu,
} from "../../features/menus";
import { useProducts } from "../../features/products";
import StickyElement from "../../components/Elements/StickyElement";
import Loader from "../../components/Elements/Loader";
import useDebounce from "../../lib/useDebounce";
import { useRestaurants } from "../../features/restaurant";
import {
  Alert,
  Button,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faExclamationTriangle,
} from "@fortawesome/pro-regular-svg-icons";
import { Box } from "@mui/system";
import { LoadingButton } from "@mui/lab";
import clearHtmlFromString from "../../lib/clearHtmlFromString";
import dynamic from "next/dynamic";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const NewDnevniMenu = () => {
  const router = useRouter();

  const [date, setDate] = useState(
    Object.keys(router.query).length
      ? router.query.date
      : new Date().toISOString().split("T")[0]
  );

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    Object.keys(router.query).length ? +router.query.restaurantId : ""
  );

  const { data: products, isFetching: isLoadingProducts } = useProducts({
    productsPerPage: 8,
    search: debouncedSearch,
  });

  const { data: restaurants, isLoading: isLoadingRestaurants } =
    useRestaurants();

  useEffect(() => {
    if (restaurants) {
      setSelectedRestaurantId(restaurants[0]?.id);
    }
  }, [restaurants]);

  const { data: menus, isLoading } = useMenusByDate(
    {
      date: date,
      restaurantId: selectedRestaurantId,
    },
    {
      enabled: !!restaurants,
    }
  );
  const [activeMenu, setActiveMenu] = useState(
    Object.keys(router.query).length ? +router.query.activeMenu : null
  );
  const [menuStatus, setMenuStatus] = useState("draft");
  const [menuTitle, setMenuTitle] = useState("");

  useEffect(() => {
    if (menus) {
      setActiveMenu(menus[0]?.id);
    }
  }, [menus]);

  useEffect(() => {
    if (menus && activeMenu) {
      const currentMenu = menus.find((item) => item.id === activeMenu);
      setMenuProducts(currentMenu?.products);
      setMenuStatus(currentMenu?.status || "draft");
      setMenuTitle(currentMenu?.title);
    }
  }, [menus, activeMenu]);

  const [alertOpened, setAlertOpened] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("alertDismissed");
    if (dismissed !== "true") {
      setAlertOpened(true);
    }
  }, []);

  const [menuProducts, setMenuProducts] = useState(null);

  const [selectedMenu, setSelectedMenu] = useState("dorucak-menu");

  const addSelectedProduct = (product) => {
    const menuName = selectedMenu.split("-")[0];
    const mealName = selectedMenu.split("-")[1];
    let menuCopy = { ...menuProducts };
    if (!(menuName in menuCopy)) {
      menuCopy[menuName] = {};
      menuCopy[menuName][mealName] = [];
    }
    if (!(mealName in menuCopy[menuName]) || !menuCopy[menuName]) {
      menuCopy[menuName][mealName] = [];
    }
    if (menuCopy[menuName][mealName].some((item) => item.id === product.id)) {
      toast.error("Ovaj je proizvod već dodan");
      return;
    }
    menuCopy[menuName][mealName].push({
      id: product.id,
      title: product.name,
      stock: product.stock,
      allergens: product.allergens,
      weight: product.weight,
      price: product.price,
    });
    setMenuProducts(menuCopy);
  };

  const clearEmptyMeals = () => {
    let menuCopy = { ...menuProducts };
    Object.keys(menuCopy).forEach((menu) => {
      Object.keys(menuCopy[menu]).forEach((meal) => {
        if (menuCopy[menu][meal].length === 0) {
          delete menuCopy[menu][meal];
        }
      });
      if (Object.keys(menuCopy[menu]).length === 0) {
        delete menuCopy[menu];
      }
    });
    return menuCopy;
  };

  const handleRemoveItem = (value, productId) => {
    const menuName = value.split("-")[0];
    const mealName = value.split("-")[1];
    let menuCopy = { ...menuProducts };
    let activeMenu = menuCopy[menuName][mealName];
    const index = activeMenu.findIndex((item) => item.id === productId);
    activeMenu.splice(index, 1);
    setMenuProducts(menuCopy);
  };

  const { mutate: createMenu, isLoading: isCreating } = useCreateMenu();
  const { mutate: updateMenu, isLoading: isUpdating } = useUpdateMenu();
  const { mutate: deleteMenu, isLoading: isDeleting } = useDeleteMenu();

  const handleSaveMenu = async () => {
    if (!date) {
      toast.error("Odaberite datum");
      return;
    }

    if (selectedRestaurantId === 0) {
      toast.error("Odaberite restoran");
      return;
    }

    if (!activeMenu) {
      toast.error("Odaberite menu");
      return;
    }

    updateMenu({
      id: activeMenu,
      menu_date: date,
      products: clearEmptyMeals(),
      restaurantId: selectedRestaurantId,
      status: menuStatus,
      title: menuTitle,
    });
  };

  const [deleteMenuDialog, setDeleteMenuDialog] = useState(false);
  const [addMenuDialog, setAddMenuDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  const handleDeleteMenu = () => {
    deleteMenu(activeMenu, {
      onSuccess: () => {
        setDeleteMenuDialog(false);
        setActiveMenu(menus[0]?.id);
      },
    });
  };
  const handleCreateMenu = () => {
    createMenu(
      {
        menu_date: date,
        restaurantId: selectedRestaurantId,
        title: dialogTitle,
      },
      {
        onSuccess: (newMenu) => {
          setAddMenuDialog(false);
          setDialogTitle("");
          setActiveMenu(newMenu.id);
        },
      }
    );
  };

  return (
    <Layout>
      <Header title="Dnevni menu" />

      <div className="px-5 md:px-10 py-6 mx-auto">
        <div className="mb-4 flex flex-col items-start">
          <Collapse in={alertOpened} className="w-full">
            <Alert
              severity="info"
              className="mb-6"
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  className="w-7"
                  onClick={() => {
                    setAlertOpened(false);
                    window.localStorage.setItem("alertDismissed", "true");
                  }}
                >
                  <FontAwesomeIcon icon={faClose} />
                </IconButton>
              }
            >
              Promjenom restorana, nakon uređivanja menija, sve promjene koje
              nisu spremljene će biti izgubljene.
            </Alert>
          </Collapse>
          {isLoadingRestaurants ? (
            <CircularProgress size={24} />
          ) : (
            <TextField
              select
              label="Odaberi restoran"
              className="min-w-[200px]"
              value={selectedRestaurantId}
              onChange={(e) => {
                setSelectedRestaurantId(e.target.value);
              }}
              helperText="Odaberi restoran za koji slažeš menu"
            >
              {restaurants?.map((restaurant) => (
                <MenuItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.title.replace(/<\/?[^>]+(>|$)/g, "")}
                </MenuItem>
              ))}
            </TextField>
          )}
        </div>
        <StickyElement
          className="transition-shadow duration-500 rounded-b-lg bg-background"
          stickyClassName="shadow-lg"
        >
          <AutosuggestInput
            items={products}
            value={search}
            loading={isLoadingProducts}
            onChange={setSearch}
            onSelected={(value) => addSelectedProduct(value)}
            placeholder="Dodaj proizvode..."
            disabled={!activeMenu}
            displayItems={8}
          />
        </StickyElement>
        <div className="mt-8 flex flex-col-reverse items-start justify-between sm:flex-row md:items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center mt-8 sm:mt-0">
              <div className="mr-2">Odaberite datum:</div>
              <DateInput
                value={date}
                onChange={(value) => {
                  setDate(value);
                  setActiveMenu(null);
                  setMenuProducts(null);
                }}
              />
            </div>
            <div className="row items-center">
              <Tooltip title="Dodaj menu na odabrani datum" arrow>
                <Button
                  variant="outlined"
                  onClick={() => setAddMenuDialog(true)}
                >
                  Dodaj menu
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
        {!!menus && menus.length > 0 && !!activeMenu && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: "divider", marginTop: 4 }}>
              <Tabs
                value={activeMenu}
                onChange={(event, newValue) => setActiveMenu(newValue)}
              >
                {menus.map((menu) => (
                  <Tab
                    key={menu.id}
                    label={clearHtmlFromString(menu.title)}
                    value={menu.id}
                    icon={
                      menu.status !== "publish" ? (
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="text-error"
                        />
                      ) : null
                    }
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Box>
            <QuillTextEditor
              value={menuTitle}
              onChange={setMenuTitle}
              formats={[]}
              containerClassName="mr-2 mt-4"
              className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
              placeholder="Naziv"
              useToolbar={false}
            />
            <div className="mt-4 flex items-center justify-between">
              <TextField
                value={menuStatus}
                onChange={(e) => setMenuStatus(e.target.value)}
                className="!w-[150px] !mr-4"
                select
                size="small"
                label="Status menija"
              >
                <MenuItem value="draft">Skica</MenuItem>
                <MenuItem value="publish">Objavljeno</MenuItem>
              </TextField>
              <div>
                <LoadingButton
                  onClick={handleSaveMenu}
                  loading={isCreating || isUpdating}
                  variant="contained"
                  className="!bg-primary"
                >
                  Spremi
                </LoadingButton>
                <Tooltip title="Dodaj menu na odabrani datum" arrow>
                  <Button
                    variant="outlined"
                    color="error"
                    className="!ml-2"
                    onClick={() => setDeleteMenuDialog(true)}
                  >
                    Obriši
                  </Button>
                </Tooltip>
              </div>
            </div>
          </>
        )}

        <div className="mt-10">
          {isLoading ? (
            <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
          ) : !activeMenu ? (
            <div className="text-gray-600 mt-20 text-center">
              Odaberite menu za dodavanje proizvoda
            </div>
          ) : (
            <MenuSelect
              menuProducts={menuProducts}
              value={selectedMenu}
              onSelect={(value) => setSelectedMenu(value)}
              handleRemoveItem={handleRemoveItem}
            />
          )}
        </div>
      </div>

      <Dialog
        open={deleteMenuDialog}
        onClose={() => setDeleteMenuDialog(false)}
      >
        <DialogTitle>Brisanje menija</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se briše menu. Radnja se ne može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteMenuDialog(false)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton
            color="error"
            onClick={handleDeleteMenu}
            loading={isDeleting}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addMenuDialog}
        onClose={() => {
          setAddMenuDialog(false);
          setDialogTitle("");
        }}
      >
        <DialogTitle>Dodaj novi menu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Dodaje novi menu na odabrani datum. Neće odmah biti vidljiv na
            stranici.
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
              setAddMenuDialog(false);
              setDialogTitle("");
            }}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton onClick={handleCreateMenu} loading={isCreating}>
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default NewDnevniMenu;

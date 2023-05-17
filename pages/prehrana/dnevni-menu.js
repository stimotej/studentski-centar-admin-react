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
  faEdit,
  faExclamationTriangle,
} from "@fortawesome/pro-regular-svg-icons";
import { Box } from "@mui/system";
import { LoadingButton } from "@mui/lab";
import clearHtmlFromString from "../../lib/clearHtmlFromString";
import dynamic from "next/dynamic";
import LinijeDialog from "../../components/Prehrana/LinijeDialog";
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
    Object.keys(router.query).length ? +router.query.restaurantId : 0
  );

  const { data: products, isFetching: isLoadingProducts } = useProducts({
    productsPerPage: 8,
    search: debouncedSearch,
  });

  const { data: restaurants, isLoading: isLoadingRestaurants } =
    useRestaurants();

  useEffect(() => {
    if (restaurants) {
      if (selectedRestaurantId !== 0) return;
      const storedRestaurant = localStorage.getItem("selected-restaurant");
      setSelectedRestaurantId(storedRestaurant || restaurants[0]?.id);
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [copiedProduct, setCopiedProduct] = useState(null);

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

  const handleMoveItem = (dragIndex, hoverIndex, menuName, mealName) => {
    let menuCopy = { ...menuProducts };
    let activeMenu = menuCopy[mealName][menuName];
    const dragProduct = activeMenu[dragIndex];
    activeMenu.splice(dragIndex, 1);
    activeMenu.splice(hoverIndex, 0, dragProduct);
    setMenuProducts(menuCopy);
  };

  const handleChangeMenu = (
    index,
    currentMenuName,
    currentMealName,
    newMenuName,
    newMealName,
    itemId
  ) => {
    // move product to new menu and meal
    let menuCopy = { ...menuProducts };

    let currentMenu = menuCopy[currentMealName][currentMenuName];
    const dragProduct = currentMenu[index];

    if (!(newMealName in menuCopy)) {
      menuCopy[newMealName] = {};
    }
    if (!(newMenuName in menuCopy[newMealName])) {
      menuCopy[newMealName][newMenuName] = [];
    }
    if (menuCopy[newMealName][newMenuName].some((item) => item.id === itemId)) {
      toast.error("Ovaj je proizvod već dodan");
      return;
    }

    currentMenu.splice(index, 1);

    let newMenu = menuCopy[newMealName][newMenuName];
    newMenu.push(dragProduct);

    setMenuProducts(menuCopy);
  };

  useEffect(() => {
    const handleCopyPaste = (e) => {
      if (e.ctrlKey && e.code === "KeyC") {
        if (selectedProduct) {
          setCopiedProduct(selectedProduct);
        }
      }
      if (e.ctrlKey && e.code === "KeyV") {
        if (copiedProduct) {
          addSelectedProduct({
            ...copiedProduct,
            name: copiedProduct.title,
          });
        }
      }
      if (e.ctrlKey && e.code === "KeyX") {
        if (selectedProduct) {
          setCopiedProduct(selectedProduct);
          handleRemoveItem(selectedMenu, selectedProduct.id);
        }
      }
      if (e.key === "Escape") {
        if (selectedProduct) {
          handleRemoveItem(selectedMenu, selectedProduct.id);
        }
      }
    };

    window.addEventListener("keydown", handleCopyPaste);
    return () => {
      window.removeEventListener("keydown", handleCopyPaste);
    };
  }, [selectedProduct, selectedMenu, copiedProduct]);

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

  const [linijeDialogOpened, setLinijeDialogOpened] = useState(false);

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
                localStorage.setItem("selected-restaurant", e.target.value);
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
        {!!menus && menus.length > 0 && !!activeMenu && restaurants.length && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: "divider", marginTop: 4 }}>
              <Tabs
                value={activeMenu}
                onChange={(event, newValue) => setActiveMenu(newValue)}
              >
                {menus.map((menu) => (
                  <Tab
                    key={menu.id}
                    label={clearHtmlFromString(menu.title || "")}
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
            <div className="mt-4 flex items-center justify-between gap-4">
              <TextField
                select
                label="Odaberi naziv linije"
                value={menuTitle}
                onChange={(e) => setMenuTitle(e.target.value)}
                fullWidth
              >
                {restaurants
                  ?.find((r) => r.id == selectedRestaurantId)
                  ?.linije?.map((linija, index) => (
                    <MenuItem key={index} value={linija}>
                      {linija}
                    </MenuItem>
                  ))}
              </TextField>
              <Button
                onClick={() => setLinijeDialogOpened(true)}
                className="whitespace-nowrap"
                size="large"
              >
                Uredi linije
                <FontAwesomeIcon icon={faEdit} className="ml-2" />
              </Button>
            </div>
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
              onSelect={setSelectedMenu}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              handleRemoveItem={handleRemoveItem}
              handleMoveItem={handleMoveItem}
              handleChangeMenu={handleChangeMenu}
            />
          )}
        </div>
      </div>

      <LinijeDialog
        value={
          restaurants?.find((r) => r.id == selectedRestaurantId)?.linije || []
        }
        opened={linijeDialogOpened}
        setOpened={setLinijeDialogOpened}
        restaurantId={selectedRestaurantId}
      />

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
          <div className="mt-4 flex items-center justify-between gap-4">
            <TextField
              select
              label="Odaberi naziv linije"
              value={dialogTitle}
              onChange={(e) => setDialogTitle(e.target.value)}
              fullWidth
            >
              {restaurants
                ?.find((r) => r.id == selectedRestaurantId)
                ?.linije?.map((linija, index) => (
                  <MenuItem key={index} value={linija}>
                    {linija}
                  </MenuItem>
                ))}
            </TextField>
            <Button
              onClick={() => setLinijeDialogOpened(true)}
              className="whitespace-nowrap"
              size="large"
            >
              Uredi linije
              <FontAwesomeIcon icon={faEdit} className="ml-2" />
            </Button>
          </div>
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

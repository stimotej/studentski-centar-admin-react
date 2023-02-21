import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import MenuSelect from "../../components/Prehrana/MenuSelect";
import AutosuggestInput from "../../components/Elements/AutosuggestInput";
import { toast } from "react-toastify";
import Header from "../../components/Header";
import { MdOutlineSaveAlt } from "react-icons/md";
import DateInput from "../../components/Elements/DateInput";
import Layout from "../../components/Layout";
import { userGroups } from "../../lib/constants";
import {
  useCreateMenu,
  useMenuByDate,
  useUpdateMenu,
} from "../../features/menus";
import { useProducts } from "../../features/products";
import StickyElement from "../../components/Elements/StickyElement";
import Loader from "../../components/Elements/Loader";
import useDebounce from "../../lib/useDebounce";
import { useRestaurants } from "../../features/restaurant";
import {
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/pro-regular-svg-icons";

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
    Object.keys(router.query).length ? router.query.restaurantId : 0
  );

  const { data: products, isFetching: isLoadingProducts } = useProducts({
    productsPerPage: 8,
    search: debouncedSearch,
  });
  const {
    data: menu,
    isLoading,
    refetch: refetchMenu,
  } = useMenuByDate(
    { date, restaurantId: selectedRestaurantId },
    {
      onSuccess: (menuRes) => {
        setMenuProducts(menuRes.products);
      },
    }
  );
  const { data: restaurants, isLoading: isLoadingRestaurants } =
    useRestaurants();

  useEffect(() => {
    setMenuProducts(menu?.products);
  }, [date]);

  useEffect(() => {
    if (selectedRestaurantId !== 0) {
      refetchMenu();
    }
  }, [selectedRestaurantId]);

  useEffect(() => {
    if (restaurants) {
      if (selectedRestaurantId !== 0) return;
      setSelectedRestaurantId(restaurants[0].id);
    }
  }, [restaurants]);

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
    });
    setMenuProducts(menuCopy);
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

  const handleSaveMenu = async () => {
    if (!date) {
      toast.error("Odaberite datum");
      return;
    }

    if (selectedRestaurantId === 0) {
      toast.error("Odaberite restoran");
      return;
    }

    if (menu?.id) {
      updateMenu({
        id: menu.id,
        products: menuProducts,
        restaurantId: selectedRestaurantId,
      });
    } else {
      createMenu({
        menu_date: date,
        products: menuProducts,
        restaurantId: selectedRestaurantId,
      });
    }
  };

  return (
    <Layout>
      <Header
        title="Dnevni menu"
        text="Spremi"
        icon={<MdOutlineSaveAlt />}
        loading={isCreating || isUpdating}
        disabled={isCreating || isUpdating}
        onClick={handleSaveMenu}
        primary
        responsive
      />
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
                  {restaurant.title}
                </MenuItem>
              ))}
            </TextField>
          )}
        </div>
        <StickyElement
          className="transition-shadow duration-500 rounded-lg bg-background"
          stickyClassName="shadow-lg"
        >
          <AutosuggestInput
            items={products}
            value={search}
            loading={isLoadingProducts}
            onChange={setSearch}
            onSelected={(value) => addSelectedProduct(value)}
            placeholder="Dodaj proizvode..."
            displayItems={8}
          />
        </StickyElement>
        <div className="mt-8 flex flex-col-reverse items-start justify-between sm:flex-row md:items-center">
          <div className="flex items-center">
            <div className="flex items-center mt-8 sm:mt-0">
              <div className="mr-2">Odaberite datum:</div>
              <DateInput value={date} onChange={(value) => setDate(value)} />
            </div>
          </div>
        </div>
        <div className="mt-10">
          {isLoading ? (
            <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
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
    </Layout>
  );
};

export default NewDnevniMenu;

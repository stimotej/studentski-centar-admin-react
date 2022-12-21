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

const NewDnevniMenu = () => {
  const router = useRouter();

  const [date, setDate] = useState(
    Object.keys(router.query).length
      ? router.query.date
      : new Date().toISOString().split("T")[0]
  );

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const { data: products, isFetching: isLoadingProducts } = useProducts({
    productsPerPage: 8,
    search: debouncedSearch,
  });
  const { data: menu, isLoading } = useMenuByDate(date, {
    onSuccess: (menuRes) => {
      setMenuProducts(menuRes.products);
    },
  });

  useEffect(() => {
    setMenuProducts(menu?.products);
  }, [date]);

  const [menuProducts, setMenuProducts] = useState(null);

  const [selectedMenu, setSelectedMenu] = useState("dorucak-menu");

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, [router]);

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

    if (menu?.id) {
      updateMenu({ id: menu.id, products: menuProducts });
    } else {
      createMenu({
        menu_date: date,
        products: menuProducts,
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

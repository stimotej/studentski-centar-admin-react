import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import MenuSelect from "../../components/Prehrana/MenuSelect";
import AutosuggestInput from "../../components/Elements/AutosuggestInput";
import Loader from "../../components/Elements/Loader";
import { toast } from "react-toastify";
import { isToday } from "../../lib/dates";
import { compareDates } from "../../lib/dates";
import Header from "../../components/Header";
import { MdOutlineSaveAlt } from "react-icons/md";
import DateInput from "../../components/Elements/DateInput";
import Layout from "../../components/Layout";
import { updateRestaurant, useRestaurant } from "../../lib/api/restaurant";
import { userGroups } from "../../lib/constants";
import LoadingButton from "@mui/lab/LoadingButton";
import { useCreateMenu, useMenus, useUpdateMenu } from "../../features/menus";
import { useUpdateRestaurant } from "../../features/restaurant";
import { useProducts } from "../../features/products";

const NewDnevniMenu = () => {
  const { data: products, isError: errorProducts } = useProducts();
  const { data: menus, isError: errorMenus } = useMenus();

  const router = useRouter();

  const [date, setDate] = useState(
    Object.keys(router.query).length
      ? router.query.date
      : new Date().toISOString().split("T")[0]
  );

  const [menu, setMenu] = useState(null);

  const [selectedMenu, setSelectedMenu] = useState("dorucak-menu");

  let postTags = [];
  const postTagsMap = useRef({
    dorucak: 45,
    rucak: 46,
    vecera: 47,
  });

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  useEffect(() => {
    if (menus) getMenuOnDate(date);
  }, [menus]);

  const getMenuOnDate = (selectedDate) => {
    setDate(selectedDate);
    let index = menus?.findIndex((item) =>
      compareDates(item.date, selectedDate)
    );
    setMenu(menus[index]);
  };

  const addSelectedProduct = (productId) => {
    const menuName = selectedMenu.split("-")[0];
    const mealName = selectedMenu.split("-")[1];
    console.log(menuName + " - " + mealName);
    let menuCopy = { ...menu };
    console.log("menuCopy: ", menuCopy);
    if (!(menuName in menuCopy)) {
      menuCopy[menuName] = {};
      menuCopy[menuName][mealName] = [];
    }
    if (!(mealName in menuCopy[menuName]) || !menuCopy[menuName]) {
      menuCopy[menuName][mealName] = [];
    }

    menuCopy[menuName][mealName].push(productId);
    console.log("uhuuu", menuCopy);
    setMenu(menuCopy);
  };

  const handleRemoveItem = (value, productId) => {
    const menuName = value.split("-")[0];
    const mealName = value.split("-")[1];
    let menuCopy = { ...menu };
    let activeMenu = menuCopy[menuName][mealName];
    const index = activeMenu.findIndex((id) => id === productId);
    activeMenu.splice(index, 1);
    setMenu(menuCopy);
  };

  const formatMenuItems = (products, mealName) => {
    if (products?.length) {
      postTags.push(postTagsMap.current[mealName]);
      return `<ul>${products
        .map(
          (proizvod) =>
            `<li>${proizvod.name} <span>${
              proizvod.weight ? `| ${proizvod.weight}g |` : ""
            } (${
              proizvod.allergens.length ? proizvod.allergens.toString() : "-"
            })</span></li>`
        )
        .join("")}</ul>`;
    } else return "";
  };

  const getProductById = (productId) => {
    const index = products.findIndex((product) => product.id === productId);
    return products[index];
  };

  const formatMenu = (menuState) => {
    let mealNames = ["dorucak", "rucak", "vecera"];
    let menuNames = ["menu", "vege_menu", "izbor", "prilozi"];
    let dbMenuNames = {
      menu: "menu",
      vege_menu: "vegeterijanski_menu",
      izbor: "izbor",
      prilozi: "prilozi",
    };
    let izbor = new Set();
    let prilozi = new Set();
    let formated = {};
    mealNames.forEach((mealName) => {
      menuNames.forEach((menuName) => {
        menuState?.[mealName]?.[menuName]?.forEach((productId) => {
          console.log(productId);
          if (mealName === "rucak" && menuName === "izbor")
            izbor.add(productId);
          if (mealName === "rucak" && menuName === "prilozi")
            prilozi.add(productId);
        });
        let dbMetaName = [mealName, dbMenuNames[menuName]].join("_");
        formated[dbMetaName] = formatMenuItems(
          menuState?.[mealName]?.[menuName]?.map((id) => getProductById(id)),
          mealName
        );
      });
    });

    formated["izbor_proizvodi"] = Array.from(izbor).toString();
    formated["prilozi_proizvodi"] = Array.from(prilozi).toString();
    console.log("formated: ", formated);
    return formated;
  };

  const { mutate: createMenu, isLoading: isCreating } = useCreateMenu();
  const { mutate: updateMenu, isLoading: isUpdating } = useUpdateMenu();

  const handleSaveMenu = async () => {
    if (!date) {
      toast.error("Odaberite datum");
      return;
    }

    if (menu?.id) {
      updateMenu({ id: menu.id, ...menu });
    } else {
      createMenu({
        menu_date: date,
        dorucak: menu?.dorucak || {},
        rucak: menu?.rucak || {},
        vecera: menu?.vecera || {},
        ostalo: menu?.ostalo || {},
      });
    }
  };

  const { mutate: updateRestaurant, isLoading: isUpdatingRestaurant } =
    useUpdateRestaurant();

  const handleSaveSite = async () => {
    updateRestaurant(
      {
        meta: formatMenu(menu),
        tags: postTags,
      },
      {
        onSettled: () => {
          postTags = [];
        },
      }
    );
  };

  useEffect(() => {
    document.addEventListener("sticky-change", (e) => {
      console.log(e);
      const header = e.detail.target; // header became sticky or stopped sticking.
      const sticking = e.detail.stuck; // true when header is sticky.
      header.classList.toggle("bg-yellow", sticking); // add drop shadow when sticking.
    });
  }, []);

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
        <div className="sticky pt-5 top-0 left-0 right-0 z-20 bg-background">
          <AutosuggestInput
            items={products}
            onSelected={(value) => addSelectedProduct(value)}
            placeholder="Dodaj proizvode..."
            displayItems={8}
          />
        </div>
        <div className="mt-8 flex flex-col-reverse items-start justify-between sm:flex-row md:items-center">
          <div className="flex items-center">
            <div className="flex items-center mt-8 sm:mt-0">
              <div className="mr-2">Odaberite datum:</div>
              <DateInput
                value={date}
                onChange={(value) => getMenuOnDate(value)}
                markedDays={menus?.map((item) => item.date)}
              />
            </div>
          </div>
          {isToday(date) && (
            // <Button
            //   text="Objavi na stranicu"
            //   className="ml-auto"
            //   loading={saveSiteLoading}
            //   onClick={handleSaveSite}
            // />
            <LoadingButton
              variant="outlined"
              loading={isUpdatingRestaurant}
              onClick={handleSaveSite}
            >
              Objavi na stranicu
            </LoadingButton>
          )}
        </div>
        <div className="mt-10">
          {products ? (
            <MenuSelect
              menu={menu}
              value={selectedMenu}
              onSelect={(value) => setSelectedMenu(value)}
              products={products}
              handleRemoveItem={handleRemoveItem}
            />
          ) : errorProducts ? (
            <div className="mt-10 text-error">
              Greška kod učitavanja proizvoda
            </div>
          ) : (
            <Loader className="w-10 h-10 mx-auto border-primary" />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewDnevniMenu;

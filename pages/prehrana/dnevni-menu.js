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
import { createMenu, updateMenu, useMenus } from "../../lib/api/menus";
import {
  getMenuProducts,
  updateMultipleProducts,
  useProducts,
} from "../../lib/api/products";
import { updateRestaurant, useRestaurant } from "../../lib/api/restaurant";
import { userGroups } from "../../lib/constants";
import LoadingButton from "@mui/lab/LoadingButton";

const NewDnevniMenu = () => {
  const { products, error: errorProducts, setProducts } = useProducts();
  const { menus, error: errorMenus, setMenus } = useMenus();

  const router = useRouter();

  const [date, setDate] = useState(
    Object.keys(router.query).length
      ? router.query.date
      : new Date().toISOString().split("T")[0]
  );

  const [menu, setMenu] = useState(null);

  const [selectedMenu, setSelectedMenu] = useState("dorucak-menu");

  const [saveLoading, setSaveLoading] = useState(false);

  const [saveSiteLoading, setSaveSiteLoading] = useState(false);

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

  const formatSiteMenu = (siteMenu) => {
    const mealName = siteMenu.name.split("-")[0];
    const menuName = siteMenu.name.split("-")[1];
    return {
      id: siteMenu.id,
      meta_data: [
        {
          key: "woosb_ids",
          value:
            menu[mealName] &&
            menu[mealName][menuName]?.map((id) => `${id}/1`).toString(),
        },
      ],
    };
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

  const handleSaveMenu = async () => {
    if (date) {
      setSaveLoading(true);
      if (menu?.id) {
        try {
          const updatedMenu = await updateMenu(menu.id, menu);

          toast.success("Uspješno spremljene promijenjene menija");

          let menusCopy = [...menus];
          let index = menusCopy.findIndex((item) =>
            compareDates(item.date, updatedMenu.date)
          );
          menusCopy[index] = updatedMenu;
          setMenus(menusCopy);
        } catch (error) {
          toast.error(`Greška kod spremanja menija`);
        } finally {
          setSaveLoading(false);
        }
      } else {
        try {
          const createdMenu = await createMenu({
            date: date,
            dorucak: menu?.dorucak || {},
            rucak: menu?.rucak || {},
            vecera: menu?.vecera || {},
            ostalo: menu?.ostalo || {},
          });

          toast.success("Uspješno spremljen menu");
          let menusCopy = [...menus];
          menusCopy.push(createdMenu);
          setMenus(menusCopy);
        } catch (error) {
          toast.error(`Greška kod spremanja menija`);
        } finally {
          setSaveLoading(false);
        }
      }
    } else {
      toast.error("Odaberite datum");
    }
  };

  const handleSaveSite = async () => {
    setSaveSiteLoading(true);
    try {
      await updateRestaurant({
        meta: formatMenu(menu),
        tags: postTags,
      });

      toast.success(`Menu uspješno objavljen na stranicu`);

      // const menuProducts = await getMenuProducts();

      // const res = await updateMultipleProducts({
      //   update: menuProducts.map((group) => formatSiteMenu(group)),
      // });
    } catch (error) {
      console.log("err", error);
      toast.error(`Greška kod objavljivanja menija na stranicu`);
    } finally {
      postTags = [];
      setSaveSiteLoading(false);
    }
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
        loading={saveLoading}
        disabled={saveLoading}
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
              loading={saveSiteLoading}
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

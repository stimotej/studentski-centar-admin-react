import React, { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import Header from "../../components/Header";
import MenuTable from "../../components/Prehrana/MenuTable";
import Layout from "../../components/Layout";
import { useMenus } from "../../lib/api/menus";
import { useProducts } from "../../lib/api/products";
import { useRouter } from "next/router";
import { userGroups } from "../../lib/constants";

const MenuList = () => {
  const { products } = useProducts();
  const { menus, error, setMenus } = useMenus();

  setMenus(menus?.sort((a, b) => new Date(b.date) - new Date(a.date)));

  const [selectedMenus, setSelectedMenus] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  const deleteMenusState = (menuIds) => {
    let menusCopy = [...menus];
    let index = 0;
    menuIds.forEach((id) => {
      index = menusCopy.findIndex((menu) => menu._id === id);
      menusCopy.splice(index, 1);
    });
    setMenus(menusCopy);
    setSelectedMenus([]);
  };

  const updateMenuState = (changedMenu, date, deletedMenu) => {
    let menusCopy = [...menus];
    let index = menusCopy.findIndex(
      (menuItem) => menuItem._id === changedMenu._id
    );
    menusCopy[index].date = date;

    if (deletedMenu) {
      index = menusCopy.findIndex(
        (menuItem) => menuItem._id === deletedMenu._id
      );
      menusCopy.splice(index, 1);
    }

    setMenus(menusCopy);
  };

  return (
    <Layout>
      <Header
        title="Popis menija"
        link
        to="/prehrana/dnevni-menu"
        text="Dodaj novi"
        icon={<MdAdd />}
        primary
        responsive
      />
      <div className="px-5 md:px-10 mx-auto py-6">
        <MenuTable
          menus={menus}
          error={error}
          products={products}
          selectedMenus={selectedMenus}
          setSelectedMenus={setSelectedMenus}
          deleteMenusState={deleteMenusState}
          updateMenuState={updateMenuState}
        />
      </div>
    </Layout>
  );
};

export default MenuList;

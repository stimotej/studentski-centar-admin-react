import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../../lib/api";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Navbar from "../../components/Prehrana/MenuPrikaz/Navbar";
import NotConnectedWarning from "../../components/Prehrana/MenuPrikaz/NotConnectedWarning";
import Menu from "../../components/Prehrana/MenuPrikaz/Menu";
import { isToday } from "../../lib/dates";

const MenuPrikaz = () => {
  const [products, setProducts] = useState(null);
  const [menu, setMenu] = useState(null);

  const [socket, setSocket] = useState(null);

  const [connected, setConnected] = useState(false);

  const activeMeal = "rucak";

  const fullscreenHandle = useFullScreenHandle();

  useEffect(() => {
    const restaurantId = localStorage.getItem("restaurant_id");

    // http://localhost:5000
    // https://studentski-centar-admin.herokuapp.com
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    api
      .get("products", {
        params: {
          per_page: 100,
        },
      })
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => console.log(error));

    api
      .get("menus", {
        params: {
          restaurant_id: restaurantId,
          date: new Date().toISOString().split("T")[0],
        },
      })
      .then((response) => setMenu(response.data[0]))
      .catch((error) => console.log(error));

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    socket?.on("connect", () => {
      console.log(socket.id);
      setConnected(true);
    });

    socket?.on("connect_error", (err) => {
      console.log(err.message);
      setConnected(false);
    });
  }, [socket]);

  useEffect(() => {
    socket?.on("product", (product) => {
      console.log("ddd", product);

      let productsCopy = [...products];
      const index = productsCopy.findIndex((item) => item.id === product.id);

      if (index === -1) productsCopy.push(product);
      else productsCopy[index] = product;

      setProducts(productsCopy);
    });

    return () => {
      socket?.off("products");
    };
  }, [products]);

  useEffect(() => {
    socket?.on("menu", (updatedMenu) => {
      console.log("menuuu", updatedMenu);
      setMenu(updatedMenu);

      if (!isToday(updatedMenu.date)) {
        api
          .get("menus", {
            params: { date: new Date().toISOString().split("T")[0] },
          })
          .then((response) => setMenu(response.data[0]))
          .catch((error) => console.log(error));
      }
    });

    return () => {
      socket?.off("menu");
    };
  }, [menu]);

  return (
    <FullScreen className="bg-background" handle={fullscreenHandle}>
      <Navbar fullscreenHandle={fullscreenHandle} />
      <section className="flex flex-col w-full items-center justify-center text-lg">
        {!connected ? (
          <NotConnectedWarning />
        ) : (
          <>
            <h1 className="text-5xl font-semibold py-10">Ručak</h1>
            <Menu products={products} menu={menu} activeMeal={activeMeal} />
          </>
        )}
      </section>
    </FullScreen>
  );
};

export default MenuPrikaz;

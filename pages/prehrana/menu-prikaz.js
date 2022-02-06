import React, { useEffect, useState, useRef } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Navbar from "../../components/Prehrana/MenuPrikaz/Navbar";
import NotConnectedWarning from "../../components/Prehrana/MenuPrikaz/NotConnectedWarning";
import Menu from "../../components/Prehrana/MenuPrikaz/Menu";
import Pusher from "pusher-js";
import { useProducts } from "../../lib/api/products";
import { useMenuToday } from "../../lib/api/menus";

const MenuPrikaz = () => {
  const { products, productsError, setProducts } = useProducts();
  const { menu, menuError, setMenu } = useMenuToday();

  const [socket, setSocket] = useState(null);

  const [connected, setConnected] = useState(true);

  const activeMeal = "rucak";

  const fullscreenHandle = useFullScreenHandle();

  useEffect(() => {
    var pusher = new Pusher(process.env.PUSHER_KEY, {
      cluster: process.env.PUSHER_CLUSTER,
      encrypted: true,
    });

    var channel = pusher.subscribe("menu-preview");

    if (products) {
      channel.bind("product", function (product) {
        let productsCopy = [...products];
        const index = productsCopy.findIndex((item) => item.id === product.id);

        if (index === -1) productsCopy.push(product);
        else productsCopy[index] = product;

        setProducts(productsCopy);
      });
    }

    return () => {
      pusher.disconnect();
    };
  }, [products]);

  // useEffect(() => {
  //   socket?.on("connect", () => {
  //     console.log(socket.id);
  //     setConnected(true);
  //   });

  //   socket?.on("connect_error", (err) => {
  //     console.log(err.message);
  //     setConnected(false);
  //   });
  // }, [socket]);

  // useEffect(() => {
  //   socket?.on("product", (product) => {
  //     console.log("ddd", product);

  //     let productsCopy = [...products];
  //     const index = productsCopy.findIndex((item) => item.id === product.id);

  //     if (index === -1) productsCopy.push(product);
  //     else productsCopy[index] = product;

  //     setProducts(productsCopy);
  //   });

  //   return () => {
  //     socket?.off("products");
  //   };
  // }, [products]);

  // useEffect(() => {
  //   socket?.on("menu", (updatedMenu) => {
  //     console.log("menuuu", updatedMenu);
  //     setMenu(updatedMenu);

  //     if (!isToday(updatedMenu.date)) {
  //       api
  //         .get("menus", {
  //           params: { date: new Date().toISOString().split("T")[0] },
  //         })
  //         .then((response) => setMenu(response.data[0]))
  //         .catch((error) => console.log(error));
  //     }
  //   });

  //   return () => {
  //     socket?.off("menu");
  //   };
  // }, [menu]);

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

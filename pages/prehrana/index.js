import Header from "../../components/Header";
import PrikazRestorana from "../../components/Prehrana/PrikazRestorana";
import Loader from "../../components/Elements/Loader";
import Link from "next/link";
import { MdOutlinePlayArrow } from "react-icons/md";
import Layout from "../../components/Layout";
import { useRestaurant } from "../../lib/api/restaurant";
import { useEffect } from "react";
import { userGroups } from "../../lib/constants";
import { useRouter } from "next/router";

const Home = () => {
  const { restaurant, error } = useRestaurant();

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, []);

  return (
    <Layout>
      <Header title="Početna" />
      <div className="flex flex-col lg:flex-row py-6 px-5 mx-auto">
        <div className="w-full md:w-1/2 p-2 md:p-6">
          <h3 className="uppercase text-primary text-sm tracking-wider mb-2">
            Prikaz restorana
          </h3>
          <span className="mb-4 text-sm text-black text-opacity-50">
            Uredite prikaz pritiskom na element koji želite urediti pa spremite
            promjene
          </span>

          {!!restaurant ? (
            <PrikazRestorana
              id={restaurant?.id}
              slika={restaurant?.image}
              naslov={restaurant?.title}
              opis={restaurant?.description}
            />
          ) : error ? (
            <div className="mt-10 text-error">
              Greška kod učitavanja restorana
            </div>
          ) : (
            <Loader className="w-10 h-10 mx-auto mt-5 border-primary" />
          )}
        </div>
        <div className="w-full md:w-1/2 p-2 md:p-6 mt-10 md:mt-0">
          <h3 className="uppercase text-primary text-sm tracking-wider">
            Menu prikaz
          </h3>
          <div className="flex w-full mt-5 md:mt-8">
            <Link href="/prehrana/menu-prikaz">
              <a className="flex items-center justify-between bg-secondary transition-shadow shadow hover:shadow-lg rounded-xl p-4 w-full">
                <span className="font-semibold">Prikaz menija</span>
                <MdOutlinePlayArrow />
              </a>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;

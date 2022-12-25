import Header from "../../components/Header";
import PrikazRestorana from "../../components/Prehrana/PrikazRestorana";
import Loader from "../../components/Elements/Loader";
import Link from "next/link";
import { MdOutlinePlayArrow } from "react-icons/md";
import Layout from "../../components/Layout";
import { useEffect } from "react";
import { userGroups } from "../../lib/constants";
import { useRouter } from "next/router";
import { useRestaurant, useUpdateRestaurant } from "../../features/restaurant";
import dynamic from "next/dynamic";
import { useState } from "react";
import Button from "../../components/Elements/Button";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Home = () => {
  const { data: restaurant, isError: error } = useRestaurant();

  const router = useRouter();

  const [workingHours, setWorkingHours] = useState("");

  useEffect(() => {
    if (restaurant) setWorkingHours(restaurant.radnoVrijeme);
  }, [restaurant]);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["prehrana"].includes(username))
      router.push("/prehrana/login");
  }, [router]);

  const { mutate: updateRestaurant, isLoading: isUpdating } =
    useUpdateRestaurant();

  const handleUpdatePost = async () => {
    updateRestaurant({
      radnoVrijeme: workingHours,
    });
  };

  return (
    <Layout>
      <Header title="Početna" />
      <div className="flex flex-col lg:flex-row py-6 px-5 mx-auto">
        <div className="w-full md:w-1/2 p-2 md:p-6">
          <h3 className="uppercase text-primary text-sm tracking-wider mb-2">
            Prikaz restorana
          </h3>

          {!!restaurant ? (
            <PrikazRestorana
              id={restaurant?.id}
              slika={restaurant?.image}
              naslov={restaurant?.title}
              ponuda={restaurant?.ponuda}
              info={restaurant?.info}
              radnoVrijeme={restaurant?.radnoVrijeme}
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
            Radno vrijeme
          </h3>
          <ReactQuill
            value={workingHours}
            onChange={setWorkingHours}
            className="mt-4 border rounded-lg"
            modules={{
              toolbar: [
                ["bold", "italic", "underline"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ color: [] }, { background: [] }],
                [{ align: ["", "center", "right", "justify"] }],
              ],
            }}
          />
          <Button
            text="Spremi"
            loading={isUpdating}
            onClick={handleUpdatePost}
            className="w-fit mt-5"
            primary
          />
          {/* <div className="flex w-full mt-5 md:mt-8">
            <Link
              href="/prehrana/menu-prikaz"
              passHref
              className="flex items-center justify-between bg-secondary transition-shadow shadow hover:shadow-lg rounded-xl p-4 w-full"
            >
              <span className="font-semibold">Prikaz menija</span>
              <MdOutlinePlayArrow />
            </Link>
          </div> */}
        </div>
      </div>
    </Layout>
  );
};

export default Home;

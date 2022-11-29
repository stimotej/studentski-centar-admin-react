import { faTrash, faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import Loader from "../../components/Elements/Loader";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import { jobsCategoryId, jobsPageId, userGroups } from "../../lib/constants";

const Poslovi = () => {
  const router = useRouter();

  const [mediaDialogOpened, setMediaDialogOpened] = useState(false);

  const [image, setImage] = useState(null);
  const [banners, setBanners] = useState([]);

  const [loadingBanners, setLoadingBanners] = useState(false);
  const [bannersError, setBannersError] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    setLoadingBanners(true);
    axios
      .get("/pages/" + jobsPageId)
      .then((res) => {
        if (res.data.meta.banners) setBanners(res.data.meta.banners.split(","));
        console.log("ddsds", res.data.meta.banners.split(","));
      })
      .catch((err) => setBannersError(err))
      .finally(() => setLoadingBanners(false));

    if (!token || !userGroups["smjestaj"].includes(username))
      router.push("/smjestaj/login");
  }, []);

  const handlePublishBanners = (bannerList) => {
    const token = window.localStorage.getItem("access_token");

    axios
      .post(
        "/pages/" + jobsPageId,
        {
          meta: { banners: bannerList.toString() },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => console.log("banners res", res.data))
      .catch((err) => console.log("banners error", err.response));
  };

  return (
    <Layout>
      <Header title="Početna" />
      <div className="px-5 md:px-10 pb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Banneri</h3>
          <button
            onClick={() => setMediaDialogOpened(true)}
            className="flex items-center gap-1 bg-secondary hover:bg-gray-200 rounded-lg py-2 px-4"
          >
            <MdAdd size={20} />
            Dodaj banner
          </button>
        </div>

        {loadingBanners ? (
          <Loader className="w-10 h-10 border-primary mx-auto mt-6" />
        ) : bannersError ? (
          <p className="text-error mt-6">Greška kod učitavanja bannera</p>
        ) : !banners || banners.length <= 0 ? (
          <p className="text-gray-500 mt-6">Nema bannera za prikaz</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {banners.map((banner) => (
              <div
                key={banner}
                className="flex flex-col gap-2 p-2 bg-white shadow-md hover:shadow-lg rounded-lg"
              >
                <IconButton
                  onClick={() => {
                    setBanners(banners.filter((item) => item !== banner));
                    handlePublishBanners(
                      banners.filter((item) => item !== banner)
                    );
                  }}
                  className="w-9 self-end"
                >
                  <FontAwesomeIcon icon={faXmark} size="sm" />
                </IconButton>
                <div className="relative w-auto h-[200px] rounded-md">
                  {!!banner && (
                    <Image
                      src={banner}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <MediaSelectDialog
        opened={mediaDialogOpened}
        onClose={() => setMediaDialogOpened(false)}
        value={image}
        onSelect={(val) => {
          setImage(val);
          setBanners([...banners, val.src]);
          handlePublishBanners([...banners, val.src]);
        }}
        categoryId={jobsCategoryId}
      />
    </Layout>
  );
};

export default Poslovi;

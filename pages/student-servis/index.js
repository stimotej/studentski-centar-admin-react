import { faTrash, faXmark } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, AlertTitle, IconButton } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import Loader from "../../components/Elements/Loader";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import {
  studentskiServisCategoryId,
  jobsPageId,
  userGroups,
} from "../../lib/constants";

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

    if (!token || !userGroups["student-servis"].includes(username))
      router.push("/student-servis/login");
  }, [router]);

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
        <Alert severity="info">Početna stranica u izradi</Alert>
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
        categoryId={studentskiServisCategoryId}
      />
    </Layout>
  );
};

export default Poslovi;

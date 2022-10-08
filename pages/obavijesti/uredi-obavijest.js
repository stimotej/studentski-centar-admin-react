import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "../../components/Obavijesti/Editor/Header";
import Sidebar from "../../components/Obavijesti/Editor/Sidebar";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import Dialog from "../../components/Elements/Dialog";
import MediaSelect from "../../components/Obavijesti/MediaSelect";
import Tabs, { Tab, Content } from "../../components/Elements/Tabs/Tabs";
import MediaFileInput from "../../components/Elements/MediaFileInput";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const QuillEditor = dynamic(
  () => import("../../components/Obavijesti/Editor/QuillEditor"),
  {
    ssr: false,
    loading: () => <Loader className="w-10 h-10 mt-5 mx-auto border-primary" />,
  }
);
import StoredPostNote from "../../components/Obavijesti/Editor/StoredPostNote";
import Layout from "../../components/Layout";
import {
  createObavijest,
  updateObavijest,
  useObavijesti,
} from "../../lib/api/obavijesti";
import { createMedia, useMedia } from "../../lib/api/obavijestiMedia";
import { obavijestiCategoryId, userGroups } from "../../lib/constants";
import Loader from "../../components/Elements/Loader";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useCategories } from "../../lib/api/categories";
// import Select from "../../components/Elements/Select";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import Select from "@mui/material/Select";

const Editor = () => {
  const [storedPostNote, setStoredPostNote] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["obavijesti"].includes(username))
      router.push("/obavijesti/login");

    let storedPostExists = false;
    storedPostKeys.forEach((key) => {
      let storedPost = window.localStorage.getItem(key);
      if (storedPost?.length) storedPostExists = true;
      if (key === "editor_content" && storedPost === "<p><br></p>")
        storedPostExists = false;
      if (key === "editor_status" && storedPost === "publish")
        storedPostExists = false;
    });
    if (storedPostExists) setStoredPostNote(true);
  }, []);

  const { obavijesti, error, setObavijesti } = useObavijesti();
  const { categories, error: errorCategories, setCategories } = useCategories();
  const { mediaList, error: errorMedia, setMediaList } = useMedia();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [status, setStatus] = useState("publish");
  const [imageId, setImageId] = useState("");

  const [startShowing, setStartShowing] = useState(null);
  const [endShowing, setEndShowing] = useState(null);
  const [showAlways, setShowAlways] = useState(false);

  const [image, setImage] = useState(null);

  useEffect(() => {
    if (Object.keys(router.query).length) {
      const postCategory = router.query.categories.find(
        (item) => parseInt(item) !== obavijestiCategoryId
      );
      console.log("adsasd", router.query);
      setTitle(router.query.title || "");
      setContent(router.query.content || "");
      setDescription(router.query.description || "");
      setCategory(parseInt(postCategory) || null);
      setStatus(router.query.status || "publish");
      setImageId(router.query.imageId || "");
      setStartShowing(router.query.start_showing || null);
      setEndShowing(router.query.end_showing || null);
      setShowAlways(router.query.show_always === "true");
    } else {
      setTitle(window.localStorage.getItem("editor_title") || "");
      setContent(window.localStorage.getItem("editor_content") || "");
      setDescription(window.localStorage.getItem("editor_description") || "");
      setCategory(
        parseInt(window.localStorage.getItem("editor_category")) || null
      );
      setStatus(window.localStorage.getItem("editor_status") || "publish");
      setImageId(window.localStorage.getItem("editor_image_id") || "");
      setStartShowing(
        window.localStorage.getItem("editor_start_showing") || null
      );
      setEndShowing(window.localStorage.getItem("editor_end_showing") || null);
      setShowAlways(
        window.localStorage.getItem("editor_show_always") === "true"
      );
    }
  }, [categories]);

  useEffect(() => {
    if (Object.keys(router.query).length)
      setImage(
        mediaList?.filter((media) => media.id === +router.query?.imageId)[0]
      );
    else setImage({ src: window.localStorage.getItem("editor_image_src") });
  }, [mediaList]);

  const [loading, setLoading] = useState(false);
  const [addMediaLoading, setAddMediaLoading] = useState(false);

  const [mediaDialog, setMediaDialog] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const storedPostKeys = [
    "editor_title",
    "editor_content",
    "editor_description",
    "editor_category",
    "editor_image_id",
    "editor_image_src",
    "editor_status",
    "editor_start_showing",
    "editor_end_showing",
    "editor_show_always",
  ];

  const resetStoredPostAndState = () => {
    storedPostKeys.forEach((key) => {
      window.localStorage.removeItem(key);
    });
    setImage(null);
    setTitle("");
    setContent("");
    setDescription("");
    setCategory(null);
    setImageId(0);
    setStatus("publish");
    setStartShowing(null);
    setEndShowing(null);
    setShowAlways(false);
  };

  const handlePost = async () => {
    setLoading(true);
    if (Object.keys(router.query).length) {
      try {
        const updatedObavijest = await updateObavijest(router.query.id, {
          title: title,
          content: content,
          description: description,
          category: category,
          status: status,
          imageId: imageId,
          startShowing: startShowing,
          endShowing: endShowing,
          showAlways: showAlways,
        });

        let obavijestiCopy = [...obavijesti];
        const index = obavijestiCopy.findIndex(
          (obavijest) => obavijest.id === updatedObavijest.id
        );
        obavijestiCopy[index] = updatedObavijest;
        setObavijesti(obavijestiCopy);
        toast.success("Uspješno spremljene promjene.");
      } catch (error) {
        if (error.response.data.data.status === 403)
          toast.error("Nemate dopuštenje za uređivanje ove obavijesti");
        else toast.error("Greška kod spremanja obavijesti");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const createdObavijest = await createObavijest({
          title: title,
          content: content,
          description: description,
          category: category,
          status: status,
          imageId: imageId || 0,
          startShowing: startShowing,
          endShowing: endShowing,
          showAlways: showAlways,
        });

        console.log("createdObavijest", createdObavijest);

        setObavijesti([...obavijesti, createdObavijest]);
        resetStoredPostAndState();
        toast.success("Uspješno objavljena obavijest.");
      } catch (error) {
        toast.error("Greška kod objavljivanja obavijesti.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreview = () => {};

  const handleAddMedia = async () => {
    setAddMediaLoading(true);
    var reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const createdMedia = await createMedia(
          reader.result,
          selectedFile.type,
          selectedFile.name
        );

        toast.success("Uspješno prenešena datoteka");
        setMediaList([...mediaList, createdMedia]);
        setSelectedFile(null);
        setSelectedTab(0);
        setSelectedImage(createdMedia);
      } catch (error) {
        toast.error("Greška kod prijenosa datoteke");
      } finally {
        setAddMediaLoading(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // Add image to editor by changing src state
  const [src, setSrc] = useState(null);

  const addImageToolbar = () => {
    setMediaDialog("contentImage");
  };

  const handleSelectMedia = () => {
    if (selectedTab === 0) {
      if (selectedImage) {
        if (mediaDialog === "featuredImage") {
          setImage(selectedImage);
          setImageId(selectedImage?.id);
          if (!router.query?.content) {
            window.localStorage.setItem("editor_image_id", selectedImage?.id);
            window.localStorage.setItem("editor_image_src", selectedImage?.src);
          }
        } else if (mediaDialog === "contentImage")
          // addImageToEditor(selectedImage.src);
          setSrc(selectedImage.src);
        setMediaDialog(null);
        setSelectedImage(null);
      }
    } else {
      handleAddMedia();
    }
  };

  const [ytModal, setYtModal] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [videoId, setVideoId] = useState("");

  const addYoutubeVideo = () => {
    console.log("yt");
    setYtModal(true);
  };

  const handleAddYtVideo = () => {
    const ytUrlParams = new URLSearchParams(ytUrl.split("?")[1]);
    setVideoId(ytUrlParams.get("v"));
    setYtModal(false);
  };

  return (
    <Layout>
      <Header />
      {/* <Actions /> */}
      <Sidebar
        saveObavijest={router.query ? true : false}
        handlePost={handlePost}
        loading={loading}
        handlePreview={handlePreview}
      >
        <div className="mt-4">Slika obavijesti:</div>
        <button
          className="mt-2 w-full bg-secondary rounded-lg text-black/50"
          onClick={() => setMediaDialog("featuredImage")}
        >
          {image?.src ? (
            <Image
              src={image?.src}
              alt={image?.alt}
              width={image?.width || 50}
              height={image?.height || 50}
              layout="responsive"
              className="rounded-lg"
            />
          ) : (
            <div className="py-3">Odaberi sliku</div>
          )}
        </button>
        <div className="mt-4">Opis:</div>
        <textarea
          className="w-full rounded-lg mt-2"
          placeholder="Kratki opis obavijesti"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            !router.query?.content &&
              window.localStorage.setItem("editor_description", e.target.value);
          }}
        />
        <div className="mt-4 mb-3">Prikazivanje na stranici:</div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex flex-col gap-4">
            <MobileDatePicker
              inputFormat="dd/MM/yyyy"
              views={["day", "month", "year"]}
              value={startShowing}
              toolbarTitle="Odaberite datum"
              className="bg-secondary rounded-lg"
              label="Početak"
              disabled={showAlways}
              onChange={(value) => {
                setStartShowing(value);
                !router.query?.content &&
                  window.localStorage.setItem("editor_start_showing", value);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <MobileDatePicker
              inputFormat="dd/MM/yyyy"
              views={["day", "month", "year"]}
              value={endShowing}
              toolbarTitle="Odaberite datum"
              className="bg-secondary rounded-lg"
              label="Kraj"
              disabled={showAlways}
              onChange={(value) => {
                setEndShowing(value);
                !router.query?.content &&
                  window.localStorage.setItem("editor_end_showing", value);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAlways}
                  onChange={(e) => {
                    setShowAlways(e.target.checked);
                    !router.query?.content &&
                      window.localStorage.setItem(
                        "editor_show_always",
                        e.target.checked
                      );
                  }}
                />
              }
              label="Uvijek prikazuj"
            />
          </div>
        </LocalizationProvider>
        {/* <div className="mt-4">Kategorija:</div> */}
        <FormControl fullWidth className="mt-4 bg-secondary rounded-lg">
          <InputLabel id="category-select">Kategorija</InputLabel>
          <Select
            labelId="category-select"
            label="Kategorija"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              !router.query?.content &&
                window.localStorage.setItem("editor_category", e.target.value);
            }}
          >
            {categories?.map((item) => (
              <MenuItem value={item.id}>{item.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <Select
          items={categories?.map((item) => ({
            text: item.name,
            value: item.id,
          }))}
          value={category}
          onChange={(value) => {
            setCategory(value);
            !router.query?.content &&
              window.localStorage.setItem("editor_category", value);
          }}
          className="!w-full mt-2"
          iconClassName="!ml-auto"
        /> */}
        <div className="mt-4">Status:</div>
        <RadioGroup
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            !router.query?.content &&
              window.localStorage.setItem("editor_status", e.target.value);
          }}
        >
          <FormControlLabel
            value="publish"
            control={<Radio />}
            label="Objavi na stranicu"
          />
          <FormControlLabel
            value="draft"
            control={<Radio />}
            label="Spremi kao skicu"
          />
        </RadioGroup>
      </Sidebar>
      {mediaDialog && (
        <Dialog
          title="Odaberite sliku"
          handleClose={() => {
            setMediaDialog(null);
            setSelectedFile(null);
            setSelectedTab(0);
            if (!image) setSelectedImage(null);
            else setSelectedImage(image);
          }}
          actions
          actionText={selectedTab === 0 ? "Odaberi" : "Prenesi"}
          handleAction={handleSelectMedia}
          loading={selectedTab === 1 && addMediaLoading}
        >
          <Tabs
            value={selectedTab}
            onTabChange={(tabId) => setSelectedTab(tabId)}
          >
            <Tab>Zbirka medija</Tab>
            <Tab>Prenesi datoteku</Tab>
            <Content>
              <MediaSelect
                mediaList={mediaList}
                value={selectedImage}
                onChange={(value) => setSelectedImage(value)}
                onDoubleClick={handleSelectMedia}
              />
            </Content>
            <Content>
              <MediaFileInput
                value={selectedFile}
                onChange={(value) => setSelectedFile(value)}
              />
            </Content>
          </Tabs>
        </Dialog>
      )}
      {ytModal && (
        <Dialog
          title="YouTube video"
          handleClose={() => {
            setYtModal(false);
          }}
          actions
          actionText={"Dodaj"}
          handleAction={handleAddYtVideo}
          loading={selectedTab === 1 && addMediaLoading}
        >
          <TextField
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            variant="filled"
            label="Url"
            className="w-full"
          />
        </Dialog>
      )}
      <div className="pr-0 lg:pr-72">
        <div className="px-5 py-10 md:p-12">
          <ReactQuill
            className="w-full mt-14 sm:mt-12 text-2xl obavijest-title bg-transparent font-semibold border-transparent focus:border-transparent focus:ring-0"
            placeholder="Naslov..."
            modules={{
              toolbar: false,
            }}
            formats={["header"]}
            value={title}
            onChange={(value) => {
              setTitle(value);
              !router.query?.content &&
                window.localStorage.setItem("editor_title", value);
            }}
          />
          {/* <QuillEditor
            value={title}
            placeholder="Naslov..."
            onChange={(value) => {
              setTitle(value);
              !router.query?.content &&
                window.localStorage.setItem("editor_title", value);
            }}
            className="w-full mt-14 sm:mt-12 text-2xl bg-transparent font-semibold border-transparent focus:border-transparent focus:ring-0"
          /> */}
          <QuillEditor
            value={content}
            onChange={(value) => {
              setContent(value);
              console.log("ql val: ", value);
              !router.query?.content &&
                window.localStorage.setItem("editor_content", value);
            }}
            addImageToolbar={addImageToolbar}
            addYoutubeVideo={addYoutubeVideo}
            videoId={videoId}
            setVideoId={setVideoId}
            src={src}
            setSrc={setSrc}
          />
        </div>
      </div>
      {storedPostNote && (
        <StoredPostNote
          text="Učitana je obavijest koja još nije objavljena"
          handleClose={() => setStoredPostNote(false)}
          handleReset={() => {
            resetStoredPostAndState();
            setStoredPostNote(false);
          }}
        />
      )}
    </Layout>
  );
};

export default Editor;

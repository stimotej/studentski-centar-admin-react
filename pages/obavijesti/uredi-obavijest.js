import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "../../components/Obavijesti/Editor/Header";
import Sidebar from "../../components/Obavijesti/Editor/Sidebar";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import Dialog from "../../components/Elements/Dialog";
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
import { useMedia } from "../../lib/api/media";
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
// import Select from "../../components/Elements/Select";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import Select from "@mui/material/Select";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import {
  useCategories,
  useCreateObavijest,
  useUpdateObavijest,
} from "../../features/obavijesti";

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
  }, [router]);

  const { data: categories } = useCategories();
  const {
    mediaList,
    error: errorMedia,
    setMediaList,
  } = useMedia(obavijestiCategoryId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [status, setStatus] = useState("publish");
  const [imageId, setImageId] = useState("");

  const [startShowing, setStartShowing] = useState(null);
  const [endShowing, setEndShowing] = useState(null);
  const [showAlways, setShowAlways] = useState(false);
  const [eventDate, setEventDate] = useState(null);

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
      setEventDate(router.query.event_date || null);
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
      setEventDate(window.localStorage.getItem("editor_event_date") || null);
    }
  }, [categories, router.query]);

  useEffect(() => {
    if (Object.keys(router.query).length)
      setImage(
        mediaList?.filter((media) => media.id === +router.query?.imageId)[0]
      );
    else setImage({ src: window.localStorage.getItem("editor_image_src") });
  }, [mediaList, router.query]);

  const [mediaDialog, setMediaDialog] = useState(null);

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
    "editor_event_date",
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
    setEventDate(null);
  };

  // Update and create handlers

  const { mutate: createObavijest, isLoading: isCreating } =
    useCreateObavijest();
  const { mutate: updateObavijest, isLoading: isUpdating } =
    useUpdateObavijest();

  const handlePost = async () => {
    const newPost = {
      title: title,
      content: content,
      description: description,
      category: category,
      status: status,
      imageId: imageId || 0,
      startShowing: startShowing,
      endShowing: endShowing,
      showAlways: showAlways,
      eventDate: eventDate,
    };
    if (Object.keys(router.query).length)
      updateObavijest({ id: router.query.id, obavijest: newPost });
    else
      createObavijest(newPost, {
        onSuccess: () => {
          resetStoredPostAndState();
        },
      });
  };

  const handlePreview = () => {};

  // Add image to editor by changing src state
  const [src, setSrc] = useState(null);

  const addImageToolbar = () => {
    setMediaDialog("contentImage");
  };

  const handleSelectMedia = (value) => {
    if (mediaDialog === "featuredImage") {
      setImage(value);
      setImageId(value?.id);
      if (!router.query?.content) {
        window.localStorage.setItem("editor_image_id", value?.id);
        window.localStorage.setItem("editor_image_src", value?.src);
      }
    } else if (mediaDialog === "contentImage")
      // addImageToEditor(value.src);
      setSrc(value.src);
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
        loading={isCreating || isUpdating}
        handlePreview={handlePreview}
      >
        <div className="mt-4">Slika obavijesti:</div>
        <button
          className="mt-2 w-full bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60"
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
              objectFit="cover"
            />
          ) : (
            <div className="py-4">Odaberi sliku</div>
          )}
        </button>
        <TextField
          className="w-full !mt-4"
          label="Kratki opis obavijesti"
          multiline
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            !router.query?.content &&
              window.localStorage.setItem("editor_description", e.target.value);
          }}
        />
        <FormControl fullWidth className="!mt-4">
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
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="mt-4 mb-3">Prikazivanje na stranici:</div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex flex-col">
            <MobileDatePicker
              inputFormat="dd/MM/yyyy"
              views={["day", "month", "year"]}
              value={startShowing}
              toolbarTitle="Odaberite datum"
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
              className="!mt-4"
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
              className="mt-1"
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
        <div className="mt-4 mb-3">Dodaj na kalendar:</div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex flex-col gap-4">
            <DateTimePicker
              inputFormat="dd/MM/yyyy HH:mm"
              value={eventDate}
              toolbarTitle="Odaberite datum"
              label="Odaberite datum"
              onChange={(value) => {
                setEventDate(value);
                !router.query?.content &&
                  window.localStorage.setItem("editor_event_date", value);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        </LocalizationProvider>
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
      <MediaSelectDialog
        opened={mediaDialog}
        onClose={() => setMediaDialog(false)}
        value={image}
        onSelect={handleSelectMedia}
        categoryId={obavijestiCategoryId}
      />
      {ytModal && (
        <Dialog
          title="YouTube video"
          handleClose={() => {
            setYtModal(false);
          }}
          actions
          actionText={"Dodaj"}
          handleAction={handleAddYtVideo}
        >
          <TextField
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            label="Url"
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

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "./Obavijesti/Editor/Header";
import Sidebar from "./Obavijesti/Editor/Sidebar";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const QuillEditor = dynamic(() => import("./Obavijesti/Editor/QuillEditor"), {
  ssr: false,
  loading: () => <Loader className="w-10 h-10 mt-5 mx-auto border-primary" />,
});
const QuillTextEditor = dynamic(() => import("./Elements/QuillTextEditor"), {
  ssr: false,
});
import StoredPostNote from "./Obavijesti/Editor/StoredPostNote";
import Layout from "./Layout";
import { obavijestiCategoryId, userGroups } from "../lib/constants";
import Loader from "./Elements/Loader";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import Select from "@mui/material/Select";
import MediaSelectDialog from "./MediaSelectDialog";
import {
  useCategories,
  useCreateObavijest,
  useObavijest,
  useUpdateObavijest,
} from "../features/obavijesti";
import MyDialog from "./Elements/MyDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import getIconByMimeType from "../lib/getIconbyMimeType";

const ObavijestEditorLayout = ({ categoryId, from }) => {
  const [storedPostNote, setStoredPostNote] = useState(false);

  const router = useRouter();

  const storedPostKeys = useMemo(
    () => [
      `${from}_editor_title`,
      `${from}_editor_content`,
      `${from}_editor_description`,
      `${from}_editor_category`,
      `${from}_editor_image_id`,
      `${from}_editor_image_src`,
      `${from}_editor_status`,
      `${from}_editor_start_showing`,
      `${from}_editor_end_showing`,
      `${from}_editor_show_always`,
      `${from}_editor_event_date`,
      `${from}_editor_files`,
    ],
    [from]
  );

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups[from].includes(username))
      router.push(`/${from}/login`);

    let storedPostExists = false;
    storedPostKeys.forEach((key) => {
      let storedPost = window.localStorage.getItem(key);
      if (storedPost?.length) storedPostExists = true;
      if (key === `${from}_editor_content` && storedPost === "<p><br></p>")
        storedPostExists = false;
      if (key === `${from}_editor_title` && storedPost === "<p><br></p>")
        storedPostExists = false;
      if (key === `${from}_editor_status` && storedPost === "publish")
        storedPostExists = false;
    });
    if (storedPostExists) setStoredPostNote(true);
  }, [router, from, storedPostKeys]);

  const { data: categories } = useCategories({
    enabled: !categoryId,
  });

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

  const [files, setFiles] = useState([]);

  const obavijestId = router.query.id;

  const { data: obavijest } = useObavijest(obavijestId, {
    enabled: !!obavijestId,
  });

  useEffect(() => {
    if (obavijest) {
      setImage(
        { src: obavijest.image !== "false" ? obavijest.image : null } || null
      );
      setTitle(obavijest.title || "");
      setContent(obavijest.content || "");
      setDescription(obavijest.description || "");
      setCategory(parseInt(obavijest.categories) || null);
      setStatus(obavijest.status || "publish");
      setImageId(obavijest.imageId || "");
      setStartShowing(obavijest.start_showing || null);
      setEndShowing(obavijest.end_showing || null);
      setShowAlways(!!obavijest.show_always);
      setEventDate(obavijest.event_date || null);
      setFiles(obavijest.documents || []);
    } else {
      setImage(
        { src: window.localStorage.getItem(`${from}_editor_image_src`) } || null
      );
      setTitle(window.localStorage.getItem(`${from}_editor_title`) || "");
      setContent(window.localStorage.getItem(`${from}_editor_content`) || "");
      setDescription(
        window.localStorage.getItem(`${from}_editor_description`) || ""
      );
      setCategory(
        parseInt(window.localStorage.getItem(`${from}_editor_category`)) || null
      );
      setStatus(
        window.localStorage.getItem(`${from}_editor_status`) || "publish"
      );
      setImageId(window.localStorage.getItem(`${from}_editor_image_id`) || "");
      setStartShowing(
        window.localStorage.getItem(`${from}_editor_start_showing`) || null
      );
      setEndShowing(
        window.localStorage.getItem(`${from}_editor_end_showing`) || null
      );
      setShowAlways(
        window.localStorage.getItem(`${from}_editor_show_always`) === "true"
      );
      setEventDate(
        window.localStorage.getItem(`${from}_editor_event_date`) || null
      );
      setFiles(
        JSON.parse(window.localStorage.getItem(`${from}_editor_files`)) || []
      );
    }
  }, [obavijest, from]);

  const [mediaDialog, setMediaDialog] = useState(null);

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
    setFiles([]);
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
      category: categoryId || category,
      status: status,
      imageId: imageId || 0,
      startShowing: startShowing,
      endShowing: endShowing,
      showAlways: showAlways,
      eventDate: eventDate,
      documents:
        files.length > 0 &&
        files.map((file) => ({
          id: file.id,
          title: file.title,
          media_type: file.mediaType,
          mime_type: file.mimeType,
          source_url: file.src,
        })),
    };
    if (obavijestId) updateObavijest({ id: obavijestId, obavijest: newPost });
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
    setMediaDialog({ type: "image", action: "contentImage" });
  };

  const handleSelectMedia = (value) => {
    if (mediaDialog.action === "featuredImage") {
      setImage(value);
      setImageId(value?.id);
      if (!obavijestId) {
        window.localStorage.setItem(`${from}_editor_image_id`, value?.id);
        window.localStorage.setItem(`${from}_editor_image_src`, value?.src);
      }
    } else if (mediaDialog.action === "contentImage") {
      // addImageToEditor(value.src);
      setSrc(value.src);
    } else if (mediaDialog.action === "document") {
      setFiles([...files, value]);
      if (!obavijestId) {
        window.localStorage.setItem(
          `${from}_editor_files`,
          JSON.stringify([...files, value])
        );
      }
    }
  };

  const [ytModal, setYtModal] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [videoId, setVideoId] = useState("");

  const addYoutubeVideo = () => {
    setYtModal(true);
  };

  const handleAddYtVideo = () => {
    const ytUrlParams = new URLSearchParams(ytUrl.split("?")[1]);
    setVideoId(ytUrlParams.get("v"));
    setYtModal(false);
  };

  const addDocumentToolbar = () => {
    setMediaDialog({ type: "application", action: "document" });
  };

  return (
    <Layout>
      <Header />
      {/* <Actions /> */}
      <Sidebar
        saveObavijest={obavijestId ? true : false}
        handlePost={handlePost}
        loading={isCreating || isUpdating}
        handlePreview={handlePreview}
      >
        <div className="mt-4">Slika obavijesti:</div>
        <button
          className="mt-2 w-full bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60"
          onClick={() =>
            setMediaDialog({ type: "image", action: "featuredImage" })
          }
        >
          {image?.src ? (
            <Image
              src={image?.src}
              alt={image?.alt || "Slika obavijesti"}
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
        <div className="mt-4 mb-2">Kratki opis obavijesti:</div>
        <QuillTextEditor
          value={description}
          onChange={(value) => {
            setDescription(value);
            !obavijestId &&
              window.localStorage.setItem(`${from}_editor_description`, value);
          }}
          placeholder="Unesi opis..."
          className="[&>div>div]:!min-h-[100px]"
          useToolbar={false}
        />
        {!categoryId ? (
          <FormControl fullWidth className="!mt-4">
            <InputLabel id="category-select">Kategorija</InputLabel>
            <Select
              labelId="category-select"
              label="Kategorija"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                !obavijestId &&
                  window.localStorage.setItem(
                    `${from}_editor_category`,
                    e.target.value
                  );
              }}
            >
              {categories?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
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
                !obavijestId &&
                  window.localStorage.setItem(
                    `${from}_editor_start_showing`,
                    value
                  );
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
                !obavijestId &&
                  window.localStorage.setItem(
                    `${from}_editor_end_showing`,
                    value
                  );
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
                    !obavijestId &&
                      window.localStorage.setItem(
                        `${from}_editor_show_always`,
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
                !obavijestId &&
                  window.localStorage.setItem(
                    `${from}_editor_event_date`,
                    value
                  );
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
            !obavijestId &&
              window.localStorage.setItem(
                `${from}_editor_status`,
                e.target.value
              );
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
        opened={!!mediaDialog}
        onClose={() => setMediaDialog(false)}
        value={image}
        onSelect={handleSelectMedia}
        categoryId={categoryId || obavijestiCategoryId}
        mediaType={mediaDialog?.type}
      />
      <MyDialog
        opened={ytModal}
        setOpened={setYtModal}
        title="YouTube video"
        actionTitle={"Dodaj"}
        onClick={handleAddYtVideo}
      >
        <TextField
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
          label="Url"
          className="mt-2"
          fullWidth
        />
      </MyDialog>
      <div className="pr-0 lg:pr-72">
        <div className="px-5 py-10 md:p-12">
          <QuillTextEditor
            value={title}
            onChange={(value) => {
              setTitle(value);
              !obavijestId &&
                window.localStorage.setItem(`${from}_editor_title`, value);
            }}
            placeholder="Naslov..."
            containerClassName="!bg-transparent border-none px-3 mt-14 sm:mt-12 "
            className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div:before]:!left-0 [&>div>div:before]:text-2xl [&>div>div:before]:font-semibold [&>div>div>p]:text-2xl [&>div>div>p]:font-semibold"
            useToolbar={false}
          />
          <QuillEditor
            value={content}
            onChange={(value) => {
              setContent(value);
              !obavijestId &&
                window.localStorage.setItem(`${from}_editor_content`, value);
            }}
            addImageToolbar={addImageToolbar}
            addYoutubeVideo={addYoutubeVideo}
            addDocumentToolbar={addDocumentToolbar}
            videoId={videoId}
            setVideoId={setVideoId}
            src={src}
            setSrc={setSrc}
          />

          {files?.length > 0 && (
            <>
              <div className="mt-8 mb-2 font-semibold">Dokumenti</div>
              <div className="flex flex-col gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-2 border border-gray-400 p-1 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={getIconByMimeType(file.mimeType)}
                        className="text-lg text-gray-800 ml-2"
                      />
                      <div className="flex-1 line-clamp-1 break-all">
                        {file.src?.split("/").pop()}
                      </div>
                    </div>
                    <IconButton
                      className="!aspect-square"
                      onClick={() => {
                        const newFiles = [...files];
                        newFiles.splice(index, 1);
                        setFiles(newFiles);
                      }}
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </IconButton>
                  </div>
                ))}
              </div>
            </>
          )}
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

export default ObavijestEditorLayout;

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Header from "../../components/Obavijesti/Editor/Header";
import Sidebar from "../../components/Obavijesti/Editor/Sidebar";
import dynamic from "next/dynamic";
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
import { eventsCategoryId } from "../../lib/constants";
import Loader from "../../components/Elements/Loader";
import {
  Checkbox,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Autocomplete from "@mui/material/Autocomplete";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-regular-svg-icons";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import {
  useCreateEvent,
  useEvent,
  useUpdateEvent,
} from "../../features/events";
import MyDialog from "../../components/Elements/MyDialog";
import getIconByMimeType from "../../lib/getIconbyMimeType";
import clearHtmlFromString from "../../lib/clearHtmlFromString";

const storedPostKeys = [
  "event_title",
  "event_content",
  "event_image_id",
  "event_image_src",
  "event_status",
  "event_location",
  "event_dates",
  "event_type",
  "event_slider",
  "event_course",
  "event_files",
];

const eventLocations = [
  "Teatar &TD",
  "Galerija SC",
  "Kiosk",
  "Francuski paviljon",
  "MM centar",
  "Kino SC",
  "SKUC",
  "Kino forum",
  "Dvorana PAUK",
  "SD Cvjetno naselje",
  "SD Stjepan Radić",
  "SD Lašćina",
  "Centar za kulturu Trešnjevka",
  "HISTRIONSKI DOM",
  "BOK fest",
  "GK Zorin dom",
];
const eventTypes = [
  "Predstava",
  "Izložba",
  "Film",
  "Koncert",
  "Tečaj",
  "Radionica",
  "Predavanje",
  "Promocija",
  "Festivali",
];

const Editor = () => {
  const [storedPostNote, setStoredPostNote] = useState(false);

  const router = useRouter();
  const eventId = router.query.id;

  useEffect(() => {
    let storedPostExists = false;
    storedPostKeys.forEach((key) => {
      let storedPost = window.localStorage.getItem(key);
      if (
        clearHtmlFromString(storedPost || "") ||
        (key === "event_status" && storedPost === "publish")
      )
        storedPostExists = true;
    });
    if (storedPostExists && !eventId) setStoredPostNote(true);
  }, [eventId]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageId, setImageId] = useState("");
  const [status, setStatus] = useState("publish");

  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("");

  const [eventDate, setEventDate] = useState(null);
  const [eventDates, setEventDates] = useState([]);

  const [addToSlider, setAddToSlider] = useState(false);

  const [image, setImage] = useState(null);

  const [files, setFiles] = useState([]);

  const { data: event } = useEvent(eventId, {
    enabled: !!eventId,
  });

  useEffect(() => {
    if (event) {
      setImage({ src: event.image !== "false" ? event.image : null } || null);
      setTitle(event.title || "");
      setContent(event.content || "");
      setImageId(event.imageId || "");
      setStatus(event.status || "publish");
      setEventDates(event.dates || []);
      setEventLocation(event.location || "");
      setEventType(event.type || "");
      setAddToSlider(event.show_on_slider || false);
      setFiles(event.documents || []);
    } else {
      setTitle(window.localStorage.getItem("event_title") || "");
      setContent(window.localStorage.getItem("event_content") || "");
      setImageId(window.localStorage.getItem("event_image_id") || "");
      setImage({ src: window.localStorage.getItem("event_image_src") });
      setStatus(window.localStorage.getItem("event_status") || "publish");
      setEventLocation(window.localStorage.getItem("event_location") || "");
      setEventDates(
        window.localStorage.getItem("event_dates")?.split(",") || []
      );
      setEventType(window.localStorage.getItem("event_type") || "");
      setAddToSlider(window.localStorage.getItem("event_slider") || false);
      setFiles(JSON.parse(window.localStorage.getItem("event_files")) || []);
    }
  }, [event]);

  const [mediaDialog, setMediaDialog] = useState(null);

  const resetStoredPostAndState = () => {
    storedPostKeys.forEach((key) => {
      window.localStorage.removeItem(key);
    });
    setImage(null);
    setTitle("");
    setContent("");
    setImageId(0);
    setStatus("publish");
    setEventLocation("");
    setEventDates([]);
    setEventType("");
    setAddToSlider(false);
    setFiles([]);
  };

  const { mutate: createEvent, isLoading: isCreating } = useCreateEvent();
  const { mutate: updateEvent, isLoading: isUpdating } = useUpdateEvent();

  const handlePost = async () => {
    const newEvent = {
      title: title,
      content: content,
      imageId: imageId || 0,
      status: status,
      dates: eventDates.map((date) => dayjs(date).toISOString()),
      location: eventLocation,
      type: eventType,
      show_on_slider: addToSlider,
      is_course: eventType === "Tečaj" || eventType === "Radionica",
      documents:
        files.length > 0 &&
        files.map((file) => ({
          id: file.id,
          title: file.title,
          media_type: file.mediaType || file.media_type,
          mime_type: file.mimeType || file.mime_type,
          source_url: file.src || file.source_url,
        })),
    };

    if (eventId) {
      updateEvent({ id: eventId, event: newEvent });
    } else {
      createEvent(newEvent, {
        onSuccess: () => {
          resetStoredPostAndState();
        },
      });
    }
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
      if (!eventId) {
        window.localStorage.setItem("event_image_id", value?.id);
        window.localStorage.setItem("event_image_src", value?.src);
      }
    } else if (mediaDialog.action === "contentImage") {
      // addImageToEditor(selectedImage.src);
      setSrc(value.src);
    } else if (mediaDialog.action === "document") {
      setFiles([...files, value]);
      if (!eventId) {
        window.localStorage.setItem(
          "event_files",
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
        saveObavijest={eventId ? true : false}
        handlePost={handlePost}
        loading={isCreating || isUpdating}
        handlePreview={handlePreview}
      >
        <div className="mt-4">Slika eventa:</div>
        <button
          className="mt-2 w-full bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60"
          onClick={() =>
            setMediaDialog({ type: "image", action: "featuredImage" })
          }
        >
          {image?.src ? (
            <Image
              src={image?.src}
              alt={image?.alt || "Slika eventa"}
              width={image?.width || 50}
              height={image?.height || 50}
              className="rounded-lg object-cover w-full h-auto"
            />
          ) : (
            <div className="py-4">Odaberi sliku</div>
          )}
        </button>
        {/* <div className="mt-4">Lokacija:</div>
        <input
          className="w-full rounded-lg mt-2"
          placeholder="Npr. 'Galerija SC'"
          value={eventLocation}
          onChange={(e) => {
            setEventLocation(e.target.value);
            !eventId &&
              window.localStorage.setItem("event_location", e.target.value);
          }}
        /> */}
        <Autocomplete
          className="mt-6"
          freeSolo
          options={eventLocations}
          renderInput={(params) => <TextField {...params} label="Lokacija" />}
          value={eventLocation || ""}
          onChangeCapture={(e, val) => {
            setEventLocation(val !== null ? val : "");
            !eventId &&
              window.localStorage.setItem(
                "event_location",
                val !== null ? val : ""
              );
          }}
          onChange={(e, val) => {
            setEventLocation(val !== null ? val : "");
            !eventId &&
              window.localStorage.setItem(
                "event_location",
                val !== null ? val : ""
              );
          }}
        />
        {/* <div className="mt-4">Program:</div>
        <input
          className="w-full rounded-lg mt-2"
          placeholder="Npr. 'Predstava'"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            !eventId &&
              window.localStorage.setItem("event_type", e.target.value);
          }}
        /> */}
        <Autocomplete
          className="mt-6"
          freeSolo
          options={eventTypes}
          renderInput={(params) => <TextField {...params} label="Program" />}
          value={eventType || ""}
          onChangeCapture={(e, val) => {
            setEventType(val !== null ? val : "");
            !eventId &&
              window.localStorage.setItem(
                "event_type",
                val !== null ? val : ""
              );
          }}
          onChange={(e, val) => {
            setEventType(val !== null ? val : "");
            !eventId &&
              window.localStorage.setItem(
                "event_type",
                val !== null ? val : ""
              );
          }}
        />

        {(eventType === "Tečaj" || eventType === "Radionica") && (
          <div className="text-sm text-light bg-gray-100 p-2 rounded-lg mt-4">
            Tečajevi i radionice se prikazuju odvojeno od ostalih evenata.
          </div>
        )}

        <div className="mt-4">Istakni event:</div>
        <FormControlLabel
          control={
            <Checkbox
              checked={addToSlider}
              onChange={(e) => {
                setAddToSlider(e.target.checked);
                !eventId &&
                  window.localStorage.setItem("event_slider", e.target.checked);
              }}
            />
          }
          label="Dodaj na slider"
        />

        {/* <div className="mt-4 mb-3">Datum i vrijeme eventa:</div>
          <div className="flex flex-col gap-4">
            <DateTimePicker
              inputFormat="DD/MM/YYYY HH:mm"
              value={eventDate}
              toolbarTitle="Odaberite datum"
              label="Odaberite datum"
              onChange={(value) => {
                setEventDate(value);
                !eventId &&
                  window.localStorage.setItem("event_date", value);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
            </div> */}
        <div className="mt-4 mb-3">Datumi eventa:</div>
        <div className="flex flex-col gap-4">
          <DateTimePicker
            inputFormat="DD/MM/YYYY HH:mm"
            value={eventDate}
            toolbarTitle="Dodaj datum"
            label="Dodaj datum"
            onAccept={(value) => {
              setEventDates([...eventDates, value]);
              !eventId &&
                window.localStorage.setItem("event_dates", [
                  ...eventDates,
                  value,
                ]);
            }}
            onClose={() => setEventDate(null)}
            onChange={(value) => {
              setEventDate(value);
            }}
            renderInput={(params) => (
              <TextField
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEventDates([...eventDates, eventDate]);
                    setEventDate(null);
                  }
                }}
                {...params}
              />
            )}
          />
        </div>
        <div className="flex flex-col gap-1 mt-2">
          {eventDates.length > 0 &&
            eventDates.map((date, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-secondary py-1 px-2 rounded-lg"
              >
                <span>{dayjs(date).format("DD.MM.YYYY HH:mm[h]")}</span>
                <IconButton
                  size="small"
                  className="px-2"
                  onClick={() => {
                    setEventDates(eventDates.filter((item) => item !== date));
                    if (!eventId) {
                      eventDates.length - 1 > 0
                        ? window.localStorage.setItem(
                            "event_dates",
                            eventDates.filter((item) => item !== date)
                          )
                        : window.localStorage.removeItem("event_dates");
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </IconButton>
              </div>
            ))}
        </div>
        <div className="mt-4">Status:</div>
        <RadioGroup
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            !eventId &&
              window.localStorage.setItem("event_status", e.target.value);
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
        categoryId={eventsCategoryId}
        mediaType={mediaDialog?.type}
      />
      <MyDialog
        opened={ytModal}
        setOpened={setYtModal}
        title="YouTube video"
        actionTitle="Dodaj"
        onClick={handleAddYtVideo}
      >
        <div className="pt-2">
          <TextField
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            label="Url"
            fullWidth
          />
        </div>
      </MyDialog>
      <div className="pr-0 lg:pr-72">
        <div className="px-5 py-10 md:p-12">
          <ReactQuill
            className="w-full mt-14 sm:mt-12 text-2xl obavijest-title bg-transparent font-semibold border-transparent focus:border-transparent focus:ring-0"
            placeholder="Naslov..."
            modules={{
              toolbar: false,
            }}
            formats={[]}
            value={title}
            onChange={(value) => {
              setTitle(value);
              !eventId && window.localStorage.setItem("event_title", value);
            }}
          />
          {/* <QuillEditor
            value={title}
            placeholder="Naslov..."
            onChange={(value) => {
              setTitle(value);
              !eventId &&
                window.localStorage.setItem("event_title", value);
            }}
            className="w-full mt-14 sm:mt-12 text-2xl bg-transparent font-semibold border-transparent focus:border-transparent focus:ring-0"
          /> */}
          <QuillEditor
            value={content}
            onChange={(value) => {
              setContent(value);
              !eventId && window.localStorage.setItem("event_content", value);
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
                      <div className="flex-1 line-clamp-1">{file.title}</div>
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

export default Editor;

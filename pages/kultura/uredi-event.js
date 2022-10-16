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
import { createMedia, useMedia } from "../../lib/api/eventsMedia";
import { userGroups } from "../../lib/constants";
import Loader from "../../components/Elements/Loader";
import {
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { useCategories } from "../../lib/api/categories";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  useEvents,
} from "../../lib/api/events";
import Autocomplete from "@mui/material/Autocomplete";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/pro-regular-svg-icons";

const Editor = () => {
  const [storedPostNote, setStoredPostNote] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["kultura"].includes(username))
      router.push("/kultura/login");

    let storedPostExists = false;
    storedPostKeys.forEach((key) => {
      let storedPost = window.localStorage.getItem(key);
      if (storedPost?.length) storedPostExists = true;
      if (key === "event_content" && storedPost === "<p><br></p>")
        storedPostExists = false;
      if (key === "event_status" && storedPost === "publish")
        storedPostExists = false;
    });
    if (storedPostExists && !Object.keys(router.query).length)
      setStoredPostNote(true);
  }, []);

  const { events, error, setEvents } = useEvents();
  const { categories, error: errorCategories, setCategories } = useCategories();
  const { mediaList, error: errorMedia, setMediaList } = useMedia();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageId, setImageId] = useState("");
  const [status, setStatus] = useState("publish");

  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("");

  const [eventDate, setEventDate] = useState(null);
  const [eventDates, setEventDates] = useState([]);

  const [image, setImage] = useState(null);

  useEffect(() => {
    if (Object.keys(router.query).length) {
      console.log("adsasd", router.query);
      setTitle(router.query.title || "");
      setContent(router.query.content || "");
      setImageId(router.query.imageId || "");
      setStatus(router.query.status || "publish");
      setEventLocation(router.query.event_location || "");
      setEventDates(router.query.event_dates.split(",") || []);
      setEventType(router.query.event_type || "");
    } else {
      setTitle(window.localStorage.getItem("event_title") || "");
      setContent(window.localStorage.getItem("event_content") || "");
      setImageId(window.localStorage.getItem("event_image_id") || "");
      setStatus(window.localStorage.getItem("event_status") || "publish");
      setEventLocation(window.localStorage.getItem("event_location") || "");
      setEventDates(
        window.localStorage.getItem("event_dates")?.split(",") || []
      );
      setEventType(window.localStorage.getItem("event_type") || "");
    }
  }, [categories]);

  useEffect(() => {
    if (Object.keys(router.query).length)
      setImage(
        mediaList?.filter((media) => media.id === +router.query?.imageId)[0]
      );
    else setImage({ src: window.localStorage.getItem("event_image_src") });
  }, [mediaList]);

  const [loading, setLoading] = useState(false);
  const [addMediaLoading, setAddMediaLoading] = useState(false);

  const [mediaDialog, setMediaDialog] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const storedPostKeys = [
    "event_title",
    "event_content",
    "event_image_id",
    "event_image_src",
    "event_status",
    "event_location",
    "event_dates",
    "event_type",
  ];

  const eventLocations = [
    "Teatar &TD",
    "Galerija SC",
    "Kiosk",
    "Francuski paviljon",
    "MM centar",
    "Kino SC",
    "SKUC",
  ];
  const eventTypes = [
    "Predstava",
    "Izložba",
    "Film",
    "Koncert",
    "Tečaj",
    "Radionica",
  ];

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
  };

  const handlePost = async () => {
    setLoading(true);
    if (Object.keys(router.query).length) {
      try {
        const changedEvent = {
          title: title,
          content: content,
          imageId: imageId,
          status: status,
          event_dates: eventDates
            .map((date) => dayjs(date).toISOString())
            .toString(),
          event_location: eventLocation,
          event_type: eventType,
        };

        const otherEvents = events.filter(
          (event) => event.event_id === router.query.id
        );

        await updateEvent(router.query.id, changedEvent);

        await Promise.all(
          otherEvents.map((event) => {
            return deleteEvent(event.id);
          })
        );

        await Promise.all(
          eventDates.map((date) => {
            return createEvent({
              ...changedEvent,
              event_date: dayjs(date).toISOString(),
              event_id: router.query.id,
            });
          })
        );

        // const updatedEvent = await updateEvent(router.query.id, {
        //   title: title,
        //   content: content,
        //   imageId: imageId,
        //   status: status,
        //   event_date: eventDate,
        //   event_location: eventLocation,
        //   event_type: eventType,
        // });

        let eventsCopy = [...events];
        const index = eventsCopy.findIndex(
          (event) => event.id === router.query.id
        );
        eventsCopy[index] = router.query;
        setEvents(eventsCopy);
        toast.success("Uspješno spremljene promjene.");
      } catch (error) {
        console.log("save error", error);
        if (error?.response?.data?.data?.status === 403)
          toast.error("Nemate dopuštenje za uređivanje ovog eventa");
        else toast.error("Greška kod spremanja eventa");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const newEvent = {
          title: title,
          content: content,
          imageId: imageId || 0,
          status: status,
          event_dates: eventDates
            .map((date) => dayjs(date).toISOString())
            .toString(),
          event_location: eventLocation,
          event_type: eventType,
        };

        const mainEvent = await createEvent(newEvent);

        await Promise.all(
          eventDates.map((date) => {
            return createEvent({
              ...newEvent,
              event_date: dayjs(date).toISOString(),
              event_id: mainEvent.id.toString(),
            });
          })
        );

        setEvents([...events, mainEvent]);
        resetStoredPostAndState();
        toast.success("Uspješno objavljen event.");
      } catch (error) {
        console.log("Greška kod", error);
        toast.error("Greška kod objavljivanja eventa.");
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
            window.localStorage.setItem("event_image_id", selectedImage?.id);
            window.localStorage.setItem("event_image_src", selectedImage?.src);
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
        <div className="mt-4">Slika eventa:</div>
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
              objectFit="cover"
              layout="responsive"
              className="rounded-lg"
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
            !router.query?.content &&
              window.localStorage.setItem("event_location", e.target.value);
          }}
        /> */}
        <Autocomplete
          className="mt-6"
          freeSolo
          options={eventLocations}
          renderInput={(params) => <TextField {...params} label="Lokacija" />}
          value={eventLocation}
          onChange={(e, val) => {
            setEventLocation(val !== null ? val : "");
            !router.query?.content &&
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
            !router.query?.content &&
              window.localStorage.setItem("event_type", e.target.value);
          }}
        /> */}
        <Autocomplete
          className="mt-6"
          freeSolo
          options={eventTypes}
          renderInput={(params) => <TextField {...params} label="Program" />}
          value={eventType}
          onChange={(e, val) => {
            setEventType(val !== null ? val : "");
            !router.query?.content &&
              window.localStorage.setItem(
                "event_type",
                val !== null ? val : ""
              );
          }}
        />
        {/* <div className="mt-4 mb-3">Datum i vrijeme eventa:</div>
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
                  window.localStorage.setItem("event_date", value);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </div>
        </LocalizationProvider> */}
        <div className="mt-4 mb-3">Datumi eventa:</div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex flex-col gap-4">
            <DateTimePicker
              inputFormat="dd/MM/yyyy HH:mm"
              value={eventDate}
              toolbarTitle="Dodaj datum"
              label="Dodaj datum"
              onAccept={(value) => {
                setEventDates([...eventDates, value]);
                !router.query?.content &&
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
                      if (!router.query?.content) {
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
        </LocalizationProvider>
        <div className="mt-4">Status:</div>
        <RadioGroup
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            !router.query?.content &&
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
                window.localStorage.setItem("event_title", value);
            }}
          />
          {/* <QuillEditor
            value={title}
            placeholder="Naslov..."
            onChange={(value) => {
              setTitle(value);
              !router.query?.content &&
                window.localStorage.setItem("event_title", value);
            }}
            className="w-full mt-14 sm:mt-12 text-2xl bg-transparent font-semibold border-transparent focus:border-transparent focus:ring-0"
          /> */}
          <QuillEditor
            value={content}
            onChange={(value) => {
              setContent(value);
              console.log("ql val: ", value);
              !router.query?.content &&
                window.localStorage.setItem("event_content", value);
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

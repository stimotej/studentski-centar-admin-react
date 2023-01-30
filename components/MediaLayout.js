import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";
import Image from "next/image";
import {
  Checkbox,
  FormControlLabel,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import MediaFileInput from "./Elements/MediaFileInput";
import Loader from "./Elements/Loader";
import Header from "./Header";
import Layout from "./Layout";
import { userGroups } from "../lib/constants";
import MyDialog from "./Elements/MyDialog";
import {
  useMedia,
  useCreateMedia,
  useDeleteMedia,
  useUpdateMedia,
} from "../features/media";
import useDebounce from "../lib/useDebounce";
import SearchHeader from "./Elements/SearchHeader";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFilePdf } from "@fortawesome/pro-regular-svg-icons";

const imageDisplaySizeClasses = {
  small: "w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6",
  medium: "w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5",
  large: "w-full sm:w-1/2 md:w-1/3 lg:w-1/4",
};

const MediaLayout = ({ categoryId, from, includeBanners }) => {
  const [sort, setSort] = useState("date|desc");
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: mediaList,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMedia({
    categoryId,
    orderby: sort?.split("|")?.[0],
    order: sort?.split("|")?.[1],
    search: debouncedSearch,
  });

  const [mediaDialog, setMediaDialog] = useState(null);

  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [isBanner, setIsBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");

  const [addNewDialog, setAddNewDialog] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [size, setSize] = useState("medium");

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups[from].includes(username))
      router.push(`/${from}/login`);
  }, [from, router]);

  const { mutate: createMedia, isLoading: isCreating } = useCreateMedia();
  const { mutate: updateMedia, isLoading: isUpdating } = useUpdateMedia();
  const { mutate: deleteMedia, isLoading: isDeleting } = useDeleteMedia();

  const handleAddMedia = async () => {
    var reader = new FileReader();
    reader.onloadend = async () => {
      createMedia(
        {
          body: reader.result,
          type: selectedFile.type,
          name: selectedFile.name,
          categoryId,
        },
        {
          onSuccess: () => {
            setSelectedFile(null);
            setAddNewDialog(false);
          },
        }
      );
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpdateMedia = async () => {
    updateMedia(
      {
        id: mediaDialog.id,
        title,
        alt,
        isBanner,
        bannerUrl,
      },
      {
        onSuccess: () => {
          setMediaDialog(null);
        },
      }
    );
  };

  const handleDeleteMedia = async () => {
    deleteMedia(mediaDialog.id, {
      onSuccess: () => {
        setMediaDialog(null);
      },
    });
  };

  return (
    <Layout>
      <Header
        title="Zbrika medija"
        text="Dodaj novi"
        onClick={() => setAddNewDialog(true)}
        icon={<MdAdd />}
        primary
        responsive
      />

      <MyDialog
        opened={addNewDialog}
        setOpened={setAddNewDialog}
        title="Prijenos medija"
        content={
          <MediaFileInput
            value={selectedFile}
            onChange={(value) => setSelectedFile(value)}
          />
        }
        actionTitle="Prenesi"
        loading={isCreating}
        onClick={handleAddMedia}
        onClose={() => setSelectedFile(null)}
      />

      <SearchHeader
        searchPlaceholder="Pretraži zbirku medija"
        className="px-4 sm:px-10 mt-10"
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        size={size}
        setSize={setSize}
      />
      <div className="flex flex-wrap px-2 sm:px-10 my-10">
        {isLoading ? (
          <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
        ) : isError ? (
          <div className="mt-4 text-error">Greška kod učitavanja medija</div>
        ) : mediaList.pages?.[0]?.length <= 0 ? (
          <div className="mt-4 text-gray-500">Nema medija za prikaz</div>
        ) : (
          mediaList.pages?.map((group, index) => (
            <Fragment key={index}>
              {group?.map((media) => (
                <div
                  key={media.id}
                  className={clsx("flex p-1", imageDisplaySizeClasses[size])}
                >
                  <button
                    key={media.id}
                    className="break-words relative w-full rounded-lg p-2 hover:bg-white hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setMediaDialog(media);
                      setTitle(media.title);
                      setAlt(media.alt);
                      setIsBanner(media.isBanner);
                      setBannerUrl(media.bannerUrl);
                    }}
                  >
                    {media?.mimeType?.includes("image") ? (
                      <Image
                        src={media.src}
                        alt={media.alt || media.title || "Medij"}
                        width={media.width || 50}
                        height={media.height || 50}
                        loading="lazy"
                        className="rounded-lg object-cover mx-auto w-full aspect-square auto"
                      />
                    ) : (
                      <div className="flex flex-col overflow-hidden gap-2 p-2 items-center justify-center w-full h-full rounded-lg bg-gray-100">
                        <FontAwesomeIcon
                          icon={
                            media?.mimeType === "application/pdf"
                              ? faFilePdf
                              : faFile
                          }
                          className="w-10 h-10 text-gray-500"
                        />
                        <span className="text-xs text-gray-900 line-clamp-2">
                          {media.title}
                        </span>
                      </div>
                    )}
                    {media.isBanner && (
                      <div className="absolute py-px px-1.5 rounded-full text-xs text-white bg-error top-0 right-0">
                        Banner
                      </div>
                    )}
                    {/* <h3 className="mt-3 font-medium text-sm text-left">
                      {media.title}
                    </h3> */}
                  </button>
                </div>
              ))}
            </Fragment>
          ))
        )}
        {hasNextPage ? (
          <div className="flex items-center justify-center w-full py-4">
            <LoadingButton
              loading={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              variant="outlined"
              size="large"
            >
              Učitaj više
            </LoadingButton>
          </div>
        ) : null}
      </div>
      <MyDialog
        maxWidth="md"
        opened={mediaDialog}
        setOpened={setMediaDialog}
        title={mediaDialog?.title}
        secondActionTitle="Spremi"
        secondOnClick={handleUpdateMedia}
        actionTitle="Obriši"
        actionColor="error"
        onClick={handleDeleteMedia}
        secondLoading={isUpdating}
        loading={isDeleting}
      >
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 rounded-lg shadow-md h-fit">
            {mediaDialog?.mimeType?.includes("image") ? (
              <Image
                src={mediaDialog?.src}
                alt={mediaDialog?.alt || "Medij"}
                width={mediaDialog?.width}
                height={mediaDialog?.height}
                className="rounded-lg w-full h-auto"
              />
            ) : (
              <div className="flex flex-col aspect-square gap-2 items-center justify-center w-full h-full rounded-lg bg-gray-100">
                <FontAwesomeIcon
                  icon={
                    mediaDialog?.mimeType === "application/pdf"
                      ? faFilePdf
                      : faFile
                  }
                  size="8x"
                  className="text-gray-500"
                />
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 pl-0 md:pl-10 pr-0 mt-6 md:mt-0">
            {includeBanners && mediaDialog?.mediaType === "image" && (
              <>
                <h3>Banner:</h3>
                <FormControlLabel
                  label="Prikazuj ovaj medij kao banner"
                  control={
                    <Checkbox
                      checked={isBanner}
                      onChange={(e) => setIsBanner(e.target.checked)}
                    />
                  }
                />
                <div className="mt-2 mb-4">
                  <TextField
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    size="small"
                    label="Url bannera"
                    fullWidth
                  />
                </div>
              </>
            )}
            <h3>Naziv:</h3>
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              size="small"
              fullWidth
              required
            />
            {mediaDialog?.mediaType === "image" && (
              <>
                <h3 className="mt-4">Alternativni tekst:</h3>
                <TextField
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  className="mt-1"
                  size="small"
                  fullWidth
                />
              </>
            )}
            <h3 className="mt-4">Objavio:</h3>
            <TextField
              value={mediaDialog?.author}
              className="mt-1"
              size="small"
              fullWidth
              disabled
            />
            <h3 className="mt-4">Datum i vrijeme:</h3>
            <TextField
              value={mediaDialog?.date?.replace("T", " ")}
              type="datetime-local"
              className="mt-1"
              size="small"
              fullWidth
              disabled
            />
            <h3 className="mt-4">URL medija:</h3>
            <div className="w-full py-2 px-3 mt-1 rounded-lg bg-secondary border-none">
              <a
                href={mediaDialog?.src}
                className="text-primary break-words underline"
              >
                {mediaDialog?.src}
              </a>
            </div>
          </div>
        </div>
      </MyDialog>
    </Layout>
  );
};

export default MediaLayout;

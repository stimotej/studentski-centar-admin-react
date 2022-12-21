import { LoadingButton } from "@mui/lab";
import { MenuItem, TextField } from "@mui/material";
import Image from "next/image";
import React from "react";
import { Fragment } from "react";
import { useState } from "react";
import {
  HiOutlineArrowNarrowDown,
  HiOutlineArrowNarrowUp,
} from "react-icons/hi";
import { MdSearch } from "react-icons/md";
import { useCreateMedia, useMedia } from "../features/media";
import useDebounce from "../lib/useDebounce";
import Loader from "./Elements/Loader";
import MediaFileInput from "./Elements/MediaFileInput";
import MyDialog from "./Elements/MyDialog";
import Tabs, { Content, Tab } from "./Elements/Tabs/Tabs";

const sortItems = [
  {
    text: "Naziv",
    value: "title_asc",
    icon: <HiOutlineArrowNarrowDown />,
  },
  { text: "Naziv", value: "title_desc", icon: <HiOutlineArrowNarrowUp /> },
  { text: "Datum", value: "date_asc", icon: <HiOutlineArrowNarrowDown /> },
  { text: "Datum", value: "date_desc", icon: <HiOutlineArrowNarrowUp /> },
];

const MediaSelectDialog = ({
  opened,
  onClose,
  value,
  onSelect,
  categoryId,
}) => {
  const [sort, setSort] = useState("date_desc");
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
    orderby: sort?.split("_")?.[0],
    order: sort?.split("_")?.[1],
    search: debouncedSearch,
  });

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelectMedia = () => {
    if (selectedTab === 0) {
      if (selectedImage) {
        onSelect(selectedImage);
        setSelectedImage(null);
        onClose();
      }
    } else {
      handleAddMedia();
    }
  };
  const { mutate: createMedia, isLoading: isCreating } = useCreateMedia();

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
          onSuccess: (createdMedia) => {
            setSelectedFile(null);
            setSelectedTab(0);
            setSelectedImage(createdMedia);
          },
        }
      );
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <MyDialog
      title="Odaberite sliku"
      maxWidth="md"
      opened={opened}
      setOpened={onClose}
      onClose={() => {
        setSelectedFile(null);
        setSelectedTab(0);
        if (!value) setSelectedImage(null);
        else setSelectedImage(value);
        onClose();
      }}
      actionTitle={selectedTab === 0 ? "Odaberi" : "Prenesi"}
      onClick={handleSelectMedia}
      loading={selectedTab === 1 && isCreating}
    >
      <Tabs value={selectedTab} onTabChange={(tabId) => setSelectedTab(tabId)}>
        <Tab>Zbirka medija</Tab>
        <Tab>Prenesi datoteku</Tab>
        <Content>
          <div className="flex flex-col-reverse md:flex-row justify-between mb-2">
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lg:mr-2"
              placeholder="Pretraži obavijesti"
              type="search"
              size="small"
              InputProps={{
                startAdornment: <MdSearch className="text-gray-500 mr-1" />,
              }}
            />
            <div className="flex items-center w-fit mb-6 md:mb-0 ml-auto">
              <span className="mr-2">Sortiraj po:</span>
              <TextField
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                select
                className="lg:mr-2"
                size="small"
                InputProps={{
                  className: "flex flex-row",
                }}
              >
                {sortItems.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <div className="flex gap-2">
                      {option.text}{" "}
                      <span className="text-gray-500">{option.icon}</span>
                    </div>
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>
          {isLoading ? (
            <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
          ) : isError ? (
            <div className="mt-10 text-error">Greška kod učitavanja medija</div>
          ) : mediaList.pages?.[0]?.length <= 0 ? (
            <div className="mt-10 text-gray-500">Nema medija za prikaz</div>
          ) : (
            <div className="flex flex-wrap">
              {mediaList.pages.map((group, index) => (
                <Fragment key={index}>
                  {group?.map((media) => (
                    <button
                      key={media.id}
                      className="w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 h-40 rounded-lg p-2"
                      onClick={() => setSelectedImage(media)}
                      onDoubleClick={handleSelectMedia}
                    >
                      <div
                        className={`relative w-full h-full rounded-lg ${
                          media.id === selectedImage?.id
                            ? "ring-2 ring-offset-2 ring-primary"
                            : "hover:ring-2 ring-primary"
                        }`}
                      >
                        <Image
                          src={media.src}
                          alt={media.alt || "Medij"}
                          width={media.width || 200}
                          height={media.height || 200}
                          loading="lazy"
                          className={`relative w-full object-cover h-full rounded-lg ${
                            media.id === selectedImage?.id
                              ? "ring-2 ring-offset-2 ring-primary"
                              : "hover:ring-2 ring-primary"
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </Fragment>
              ))}
            </div>
          )}
          {hasNextPage ? (
            <div className="flex items-center justify-center w-full pt-4">
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
        </Content>
        <Content>
          <MediaFileInput
            value={selectedFile}
            onChange={(val) => setSelectedFile(val)}
          />
        </Content>
      </Tabs>
    </MyDialog>
  );
};

export default MediaSelectDialog;

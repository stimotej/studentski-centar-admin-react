import React, { useState, useEffect, Fragment, useRef } from "react";
import { useRouter } from "next/router";
import { MdAdd } from "react-icons/md";
import Image from "next/image";
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import MediaFileInput from "./Elements/MediaFileInput";
import Loader from "./Elements/Loader";
import Header from "./Header";
import Layout from "./Layout";
import { ItemTypesDnD } from "../lib/constants";
import MyDialog from "./Elements/MyDialog";
import {
  useMedia,
  useCreateMedia,
  useDeleteMedia,
  useUpdateMedia,
  useMediaFolders,
  useCreateMediaFolder,
  useDeleteMediaFolder,
  useUpdateMediaFolder,
} from "../features/media";
import useDebounce from "../lib/useDebounce";
import SearchHeader from "./Elements/SearchHeader";
import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faEdit,
  faFolderPlus,
  faTrash,
} from "@fortawesome/pro-regular-svg-icons";
import getIconByMimeType from "../lib/getIconbyMimeType";
import { faFolder } from "@fortawesome/pro-solid-svg-icons";
import { useDrag, useDrop } from "react-dnd";

const imageDisplaySizeClasses = {
  small: "w-1/3 sm:w-1/4 md:w-1/5 lg:w-1/6",
  medium: "w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5",
  large: "w-full sm:w-1/2 md:w-1/3 lg:w-1/4",
};

const MediaLayout = ({
  categoryId,
  mediaUncategorizedFolder,
  from,
  includeBanners,
}) => {
  const [folderHistory, setFolderHistory] = useState([
    {
      name: "Sve datoteke",
      id: mediaUncategorizedFolder,
    },
  ]);

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
    media_folder: folderHistory[folderHistory.length - 1].id,
  });

  const {
    data: folders,
    isLoading: isLoadingFolders,
    isError: isErrorFolders,
  } = useMediaFolders({
    orderby: sort?.split("|")?.[0] === "title" ? "name" : undefined,
    order: sort?.split("|")?.[1],
    search: debouncedSearch,
    parent: folderHistory[folderHistory.length - 1]?.id,
  });

  const [mediaDialog, setMediaDialog] = useState(null);

  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [isBanner, setIsBanner] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [folderId, setFolderId] = useState(mediaUncategorizedFolder);

  const [addFolderDialog, setAddFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");

  const [updateFolderDialog, setUpdateFolderDialog] = useState({
    opened: false,
    folderId: null,
  });
  const [deleteFolderDialog, setDeleteFolderDialog] = useState({
    opened: false,
    folderId: null,
  });

  const [addNewDialog, setAddNewDialog] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [size, setSize] = useState("medium");

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
          media_folder: folderHistory[folderHistory.length - 1].id,
          categoryId,
        },
        {
          onError: (error) => console.log(error.response.data),
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
        folderId,
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

  const { mutate: createMediaFolder, isLoading: isCreatingFolder } =
    useCreateMediaFolder();
  const { mutate: updateMediaFolder, isLoading: isUpdatingFolder } =
    useUpdateMediaFolder();
  const { mutate: deleteMediaFolder, isLoading: isDeletingFolder } =
    useDeleteMediaFolder();

  const handleCreateFolder = () => {
    createMediaFolder(
      {
        name: folderName,
        parent: folderHistory[folderHistory.length - 1]?.id,
      },
      {
        onSuccess: () => {
          setAddFolderDialog(false);
          setFolderName("");
        },
        onError: (error) => console.log(error.response.data),
      }
    );
  };

  const handleUpdateFolder = () => {
    const selectedFolderId =
      updateFolderDialog.folderId ||
      folderHistory[folderHistory.length - 1]?.id;
    updateMediaFolder(
      {
        id: selectedFolderId,
        name: folderName,
        slug: folderName,
        // parent: folderHistory[folderHistory.length - 2]?.id,
      },
      {
        onSuccess: (folder) => {
          setUpdateFolderDialog({ opened: false, folderId: null });
          setFolderName("");
          if (!updateFolderDialog.folderId)
            setFolderHistory([
              ...folderHistory.slice(0, folderHistory.length - 1),
              folder,
            ]);
        },
      }
    );
  };

  const handleDeleteFolder = () => {
    const selectedFolderId =
      deleteFolderDialog.folderId ||
      folderHistory[folderHistory.length - 1]?.id;
    deleteMediaFolder(
      {
        id: selectedFolderId,
      },
      {
        onSuccess: () => {
          setDeleteFolderDialog({ opened: false, folderId: null });
          if (!deleteFolderDialog.folderId)
            setFolderHistory(folderHistory.slice(0, folderHistory.length - 1));
        },
      }
    );
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

      <MyDialog
        opened={addFolderDialog}
        setOpened={setAddFolderDialog}
        title="Dodaj novi folder"
        content={
          <TextField
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            label="Naziv"
            className="mt-2"
            fullWidth
          />
        }
        actionTitle="Dodaj"
        loading={isCreatingFolder}
        onClick={handleCreateFolder}
      />

      <MyDialog
        opened={updateFolderDialog.opened}
        setOpened={(opened) =>
          setUpdateFolderDialog({ opened, folderId: null })
        }
        title="Uredi folder"
        content={
          <TextField
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            label="Naziv"
            className="mt-2"
            fullWidth
          />
        }
        actionTitle="Spremi"
        loading={isUpdatingFolder}
        onClick={handleUpdateFolder}
      />

      <MyDialog
        opened={deleteFolderDialog.opened}
        setOpened={(opened) =>
          setDeleteFolderDialog({ opened, folderId: null })
        }
        title="Obriši folder"
        content='Ovime se briše trenutno otvoreni folder (Medijske datoteke će biti svrstane pod "Sve datoteke").'
        actionTitle="Obriši"
        loading={isDeletingFolder}
        onClick={handleDeleteFolder}
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

      <div className="flex flex-wrap items-center justify-between px-4 sm:px-10 mt-4">
        <div className="flex flex-wrap items-center">
          {folderHistory.map((folder, index) => (
            <FolderHistoryItem
              key={folder.id}
              folder={folder}
              isLastItem={folderHistory.length === index + 1}
              onClick={() => {
                setFolderHistory(folderHistory.slice(0, index + 1));
              }}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <Tooltip title="Dodaj novi folder" arrow>
            <IconButton onClick={() => setAddFolderDialog(true)}>
              <FontAwesomeIcon icon={faFolderPlus} />
            </IconButton>
          </Tooltip>
          {folderHistory.length > 1 && (
            <>
              <Tooltip title="Obriši folder" arrow>
                <IconButton
                  onClick={() =>
                    setDeleteFolderDialog({ opened: true, folderId: null })
                  }
                >
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Uredi naziv foldera" arrow>
                <IconButton
                  onClick={() =>
                    setUpdateFolderDialog({ opened: true, folderId: null })
                  }
                >
                  <FontAwesomeIcon icon={faEdit} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap px-2 sm:px-10 my-10">
        {isLoading || isLoadingFolders ? (
          <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
        ) : isError || isErrorFolders ? (
          <div className="mt-4 text-error">Greška kod učitavanja medija</div>
        ) : mediaList.pages?.[0]?.length <= 0 && folders.length <= 0 ? (
          <div className="mt-4 text-gray-500">Nema medija za prikaz</div>
        ) : (
          <>
            {folders.map((folder) => (
              <FolderFileItem
                key={folder.id}
                folder={folder}
                size={size}
                handleEdit={(folderId) =>
                  setUpdateFolderDialog({ opened: true, folderId })
                }
                handleDelete={(folderId) =>
                  setDeleteFolderDialog({ opened: true, folderId })
                }
                onClick={() => {
                  setFolderHistory([
                    ...folderHistory,
                    { name: folder.name, id: folder.id },
                  ]);
                }}
              />
            ))}
            {mediaList.pages?.map((group, index) => (
              <Fragment key={index}>
                {group?.map((media) => (
                  <MediaFileItem
                    key={media.id}
                    media={media}
                    size={size}
                    onClick={() => {
                      setMediaDialog(media);
                      setTitle(media.title);
                      setAlt(media.alt);
                      setIsBanner(media.isBanner);
                      setBannerUrl(media.bannerUrl);
                      setFolderId(media.folderId);
                    }}
                  />
                ))}
              </Fragment>
            ))}
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
          </>
        )}
      </div>
      <MyDialog
        maxWidth="md"
        opened={!!mediaDialog}
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
            {mediaDialog?.mediaType === "image" ? (
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
                  icon={getIconByMimeType(mediaDialog?.mimeType)}
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
              value={mediaDialog?.author || ""}
              className="mt-1"
              size="small"
              fullWidth
              disabled
            />
            <h3 className="mt-4">Datum i vrijeme:</h3>
            <TextField
              value={mediaDialog?.date?.replace("T", " ") || ""}
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

const FolderHistoryItem = ({ folder, isLastItem, onClick }) => {
  const [{ isOver }, dropHistoryItem] = useDrop(
    () => ({
      accept: ItemTypesDnD.FILE,
      drop: (item) => handlePlaceFile(item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [folder]
  );

  const { mutate: updateMedia, isLoading: isUpdating } = useUpdateMedia(false);
  const { mutate: updateMediaFolder, isLoading: isUpdatingFolder } =
    useUpdateMediaFolder(false);

  function handlePlaceFile(item) {
    if (item.id === folder.id) return;
    if (item.type === "file") {
      updateMedia({
        id: item.id,
        folderId: folder.id,
      });
      return;
    }
    updateMediaFolder({
      id: item.id,
      parent: folder.id,
    });
  }

  return (
    <>
      <button
        ref={dropHistoryItem}
        className={clsx(
          "text-primary hover:underline",
          isOver && "border border-gray-600 border-dashed rounded",
          isLastItem && "font-bold"
        )}
        onClick={onClick}
      >
        {folder.name}
      </button>
      {(isUpdating || isUpdatingFolder) && (
        <CircularProgress size={14} className="ml-2" />
      )}
      {!isLastItem && (
        <FontAwesomeIcon
          icon={faChevronRight}
          size="sm"
          className="mx-2 text-gray-500"
        />
      )}
    </>
  );
};

const FolderFileItem = ({
  folder,
  size,
  onClick,
  handleEdit,
  handleDelete,
}) => {
  const ref = useRef(null);

  const [{ isDragging }, dragFolder] = useDrag(
    () => ({
      type: ItemTypesDnD.FILE,
      item: { id: folder.id, type: "folder" },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [folder]
  );

  const [{ isOver }, dropFolder] = useDrop(
    () => ({
      accept: ItemTypesDnD.FILE,
      drop: (item) => handlePlaceFile(item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [folder]
  );

  const { mutate: updateMedia, isLoading: isUpdating } = useUpdateMedia(false);
  const { mutate: updateMediaFolder, isLoading: isUpdatingFolder } =
    useUpdateMediaFolder(false);

  function handlePlaceFile(item) {
    if (item.id === folder.id) return;
    if (item.type === "file") {
      updateMedia({
        id: item.id,
        folderId: folder.id,
      });
      return;
    }
    updateMediaFolder({
      id: item.id,
      parent: folder.id,
    });
  }

  const [contextMenu, setContextMenu] = React.useState(null);

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };

  dragFolder(dropFolder(ref));

  return (
    <>
      <div
        ref={ref}
        onContextMenu={handleContextMenu}
        className={clsx(
          "flex p-1 aspect-square relative",
          isDragging && "opacity-30",
          isOver && "border-2 border-gray-600 border-dashed rounded-lg",
          imageDisplaySizeClasses[size]
        )}
      >
        {(isUpdating || isUpdatingFolder) && (
          <div className="absolute inset-3 rounded-lg bg-black/10 z-10">
            <CircularProgress className="absolute z-20 opacity-40 left-1/2 top-1/2 !transform !-translate-x-1/2 !-translate-y-1/2" />
          </div>
        )}
        <button
          key={folder.id}
          className="break-words relative w-full rounded-lg p-2 hover:bg-white hover:shadow-lg transition-shadow"
          onClick={onClick}
        >
          <div className="flex flex-col overflow-hidden gap-2 p-3 items-center justify-center w-full h-full rounded-lg bg-gray-100">
            <FontAwesomeIcon
              icon={faFolder}
              className="w-10 h-10 text-yellow-400"
            />
            <span className="text-xs text-gray-900 line-clamp-2 break-all">
              {folder.name}
            </span>
          </div>
        </button>
      </div>
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            handleEdit && handleEdit(folder.id);
            setContextMenu(null);
          }}
        >
          <FontAwesomeIcon icon={faEdit} className="mr-3" />
          Uredi naziv
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete && handleDelete(folder.id);
            setContextMenu(null);
          }}
        >
          <FontAwesomeIcon icon={faTrash} className="mr-3" />
          Obriši
        </MenuItem>
      </Menu>
    </>
  );
};

const MediaFileItem = ({ media, size, onClick }) => {
  const [{ isDragging }, dragFile] = useDrag(
    () => ({
      type: ItemTypesDnD.FILE,
      item: { id: media.id, type: "file" },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [media]
  );

  return (
    <div
      ref={dragFile}
      className={clsx(
        "flex p-1 aspect-square",
        isDragging && "opacity-30",
        imageDisplaySizeClasses[size]
      )}
    >
      <button
        className="break-words relative w-full rounded-lg p-2 hover:bg-white hover:shadow-lg transition-shadow"
        onClick={onClick}
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
          <div className="flex flex-col overflow-hidden gap-2 p-3 items-center justify-center w-full h-full rounded-lg bg-gray-100">
            <FontAwesomeIcon
              icon={getIconByMimeType(media.mimeType)}
              className="w-10 h-10 text-gray-500"
            />
            <span className="text-xs text-gray-900 line-clamp-2 break-all">
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
  );
};

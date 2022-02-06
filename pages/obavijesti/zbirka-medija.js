import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Dialog from "../../components/Elements/Dialog";
import MediaFileInput from "../../components/Elements/MediaFileInput";
import Loader from "../../components/Elements/Loader";
import Header from "../../components/Header";
import SearchBar from "../../components/Elements/SearchBar";
import Select from "../../components/Elements/Select";
import {
  HiOutlineArrowNarrowUp,
  HiOutlineArrowNarrowDown,
} from "react-icons/hi";
import { MdAdd } from "react-icons/md";
import Layout from "../../components/Layout";
import Image from "next/image";
import {
  createMedia,
  deleteMedia,
  updateMedia,
  useMedia,
} from "../../lib/api/obavijestiMedia";
import { userGroups } from "../../lib/constants";

const Media = () => {
  const { mediaList, error, setMediaList } = useMedia();

  const [filteredMedia, setFilteredMedia] = useState([]);

  const [mediaDialog, setMediaDialog] = useState(null);

  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");

  const [addNewDialog, setAddNewDialog] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("title_asc");

  const [loading, setLoading] = useState(false);

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

  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["obavijesti"].includes(username))
      router.push("/obavijesti/login");
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const searchValue = e.target.value.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
      ""
    );
    let filteredCopy = mediaList.filter((media) => {
      return media.title.toLowerCase().search(searchValue.toLowerCase()) !== -1;
    });
    setFilteredMedia(filteredCopy);
    if (!searchValue.length) setFilteredMedia([]);
  };

  const sortMedia = (value) => {
    setSort(value);
    const field = value.split("_")[0];
    if (value === "title_asc") {
      setMediaList(
        mediaList.sort((a, b) =>
          a[field].toUpperCase() > b[field].toUpperCase()
            ? 1
            : b[field].toUpperCase() > a[field].toUpperCase()
            ? -1
            : 0
        )
      );
    } else if (value === "title_desc") {
      setMediaList(
        mediaList.sort((a, b) =>
          a[field].toUpperCase() < b[field].toUpperCase()
            ? 1
            : b[field].toUpperCase() < a[field].toUpperCase()
            ? -1
            : 0
        )
      );
    } else if (value === "date_asc") {
      setMediaList(
        mediaList.sort((a, b) => new Date(b[field]) - new Date(a[field]))
      );
    } else if (value === "date_desc") {
      setMediaList(
        mediaList.sort((a, b) => new Date(a[field]) - new Date(b[field]))
      );
    }
  };

  const handleAddMedia = async () => {
    setLoading(true);
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
        setAddNewDialog(false);
      } catch (error) {
        toast.error("Greška kod prijenosa datoteke");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleUpdateMedia = async () => {
    setLoading(true);
    try {
      const updatedMedia = await updateMedia(mediaDialog.id, {
        title,
        alt,
      });

      let mediaListCopy = [...mediaList];
      const index = mediaListCopy.findIndex(
        (media) => media.id === updatedMedia.id
      );
      mediaListCopy[index] = updatedMedia;
      setMediaList(mediaListCopy);
      setMediaDialog(null);
      toast.success("Medij uspješno spremljen");
    } catch (error) {
      if (error.response.data.data.status === 403)
        toast.error("Nemate dopuštenje za uređivanje ovog medija");
      else toast.error("Greška kod spremanja medija");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    setLoading(true);
    try {
      const deletedMediaId = await deleteMedia(mediaDialog.id);

      let mediaListCopy = [...mediaList];
      const index = mediaListCopy.findIndex(
        (media) => media.id === deletedMediaId
      );
      mediaListCopy.splice(index, 1);
      setMediaList(mediaListCopy);
      setMediaDialog(null);
      toast.success("Medij uspješno obrisan");
    } catch (error) {
      if (error.response.data.data.status === 403)
        toast.error("Nemate dopuštenje za brisanje ovog medija");
      else toast.error("Greška kod brisanja medija");
    } finally {
      setLoading(false);
    }
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
      {addNewDialog && (
        <Dialog
          title="Prijenos medija"
          handleClose={() => {
            setAddNewDialog(false);
            setSelectedFile(null);
          }}
          actions
          actionText="Prenesi"
          handleAction={handleAddMedia}
          loading={loading}
        >
          <MediaFileInput
            value={selectedFile}
            onChange={(value) => setSelectedFile(value)}
          />
        </Dialog>
      )}
      <div className="flex flex-col-reverse md:flex-row justify-between px-4 sm:px-10 mt-10">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Pretraži medije"
        />
        <div className="flex items-center w-fit mb-6 md:mb-0 ml-auto">
          <span className="mr-2">Sortiraj po:</span>
          <Select
            items={sortItems}
            value={sort}
            onChange={sortMedia}
            className="w-fit flex-grow"
          />
        </div>
      </div>
      <div className="flex flex-wrap px-2 sm:px-10 my-10">
        {mediaList ? (
          (filteredMedia.length || search.length
            ? filteredMedia
            : mediaList
          )?.map((media) => (
            <div
              key={media.id}
              className="flex w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2"
            >
              <button
                key={media.id}
                className="break-words w-full rounded-lg p-2 hover:bg-white hover:shadow-lg transition-shadow"
                onClick={() => {
                  setMediaDialog(media);
                  setTitle(media.title);
                  setAlt(media.alt);
                }}
              >
                <Image
                  src={media.src}
                  alt={media.alt}
                  width={media.width || 50}
                  height={media.height || 50}
                  layout="responsive"
                  className="rounded-lg mx-auto"
                />
                <h3 className="mt-3 font-semibold text-left">{media.title}</h3>
              </button>
            </div>
          ))
        ) : error ? (
          <div className="mt-10 text-error">Greška kod učitavanja medija</div>
        ) : (
          <Loader className="w-10 h-10 mx-auto mt-12 border-primary" />
        )}
      </div>
      {mediaDialog && (
        <Dialog
          title={mediaDialog.title}
          handleClose={() => setMediaDialog(null)}
          actionText="Spremi"
          handleAction={handleUpdateMedia}
          secondActionText="Obriši"
          handleSecondAction={handleDeleteMedia}
          loading={loading}
        >
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 rounded-lg shadow-md h-fit">
              <Image
                src={mediaDialog.src}
                alt={mediaDialog.alt}
                width={mediaDialog.width}
                height={mediaDialog.height}
                layout="responsive"
                className="rounded-lg"
              />
            </div>

            <div className="w-full md:w-1/2 pl-0 md:pl-10 pr-0 mt-6 md:mt-0">
              <h3>Naziv:</h3>
              <input
                type="text"
                className="w-full mt-2 rounded-lg bg-secondary border-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <h3 className="mt-4">Alternativni tekst:</h3>
              <input
                type="text"
                className="w-full mt-2 rounded-lg bg-secondary border-none"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                required
              />
              <h3 className="mt-4">Objavio:</h3>
              <div className="w-full py-2 px-3 mt-2 rounded-lg bg-secondary border-none">
                {mediaDialog.author}
              </div>
              <h3 className="mt-4">Datum i vrijeme:</h3>
              <div
                type="datetime-local"
                className="w-full py-2 px-3 mt-2 rounded-lg bg-secondary border-none"
              >
                {mediaDialog.date.replace("T", " ")}
              </div>
              <h3 className="mt-4">URL medija:</h3>
              <div className="w-full py-2 px-3 mt-2 rounded-lg bg-secondary border-none">
                <a href={mediaDialog.src} className="text-primary break-words">
                  {mediaDialog.src}
                </a>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </Layout>
  );
};

export default Media;

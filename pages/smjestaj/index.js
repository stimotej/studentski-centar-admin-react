import Header from "../../components/Header";
import Layout from "../../components/Layout";
import React, { useEffect, useState } from "react";
import {
  adminSmjestajCategory,
  infoSmjestajCardsCategory,
  infoSmjestajNatjecajCategory,
  infoSmjestajTogglesCategory,
  smjestajCategoryId,
  smjestajNatjecajDokumentSlug,
} from "../../lib/constants";
import {
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import { LoadingButton } from "@mui/lab";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";
import ReorderImages from "../../components/Elements/ReorderImages";
import EditLocation from "../../components/Elements/EditLocation";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import getIconByMimeType from "../../lib/getIconbyMimeType";
import {
  useAdminCategories,
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "../../features/posts";
import dynamic from "next/dynamic";
import LocalizedField from "../../components/Elements/LocalizedField";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false },
);

const Home = () => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useAdminCategories({
    parent: adminSmjestajCategory,
    orderby: "description",
  });

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    refetch: refetchPosts,
    isRefetching: isRefetchingPosts,
  } = usePosts(
    {
      categories: adminSmjestajCategory,
    },
    {
      enabled: !!categories,
    },
  );

  const [page, setPage] = useState(0);
  const [category, setCategory] = useState(0);

  const [addPostDialog, setAddPostDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");

  const [deletePostDialog, setDeletePostDialog] = useState(false);

  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [sadrzaj, setSadrzaj] = useState("");
  const [sadrzajEn, setSadrzajEn] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [radnoVrijemeBlagajni, setRadnoVrijemeBlagajni] = useState("");
  const [lokacija, setLokacija] = useState("");
  const [imageGroups, setImageGroups] = useState([]);
  const [status, setStatus] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [actionType, setActionType] = useState("link");
  const [actionLink, setActionLink] = useState("");
  const [actionDocuments, setActionDocuments] = useState([]);
  const [cardMediaDialog, setCardMediaDialog] = useState(false);

  const natjecajDokumentPost = posts?.find(
    (post) => post.slug === smjestajNatjecajDokumentSlug,
  );

  const [editingNatjecajDokument, setEditingNatjecajDokument] = useState(false);
  const [natjecajTitle, setNatjecajTitle] = useState("");
  const [natjecajOpis, setNatjecajOpis] = useState("");
  const [natjecajDocuments, setNatjecajDocuments] = useState([]);
  const [natjecajMediaDialog, setNatjecajMediaDialog] = useState(false);

  useEffect(() => {
    setNatjecajTitle(natjecajDokumentPost?.title || "");
    setNatjecajOpis(natjecajDokumentPost?.excerpt || "");
    setNatjecajDocuments(natjecajDokumentPost?.documents || []);
  }, [natjecajDokumentPost]);

  useEffect(() => {
    if (posts) {
      const dormitory = posts.find((d) => d.id === page) || posts?.[0];
      const categoryId =
        categories?.find((c) => dormitory.categories.includes(c.id))?.id ||
        categories?.[0]?.id;
      if (!dormitory) return;
      setPage(dormitory.id);
      setCategory(categoryId);
      setImage(dormitory.imageId);
      setTitle(dormitory.title);
      setExcerpt(dormitory.excerpt);
      setContent(dormitory.content);
      setSadrzaj(dormitory.sadrzaj);
      setSadrzajEn(dormitory.sadrzaj_en || "");
      setRadnoVrijemeBlagajni(dormitory.radno_vrijeme_blagajni);
      setKontakt(dormitory.kontakt);
      setLokacija(dormitory.lokacija);
      setImageGroups(dormitory.image_groups || []);
      setStatus(dormitory.status == "publish");
      setActionTitle(dormitory.actionTitle || "");
      setActionLink(dormitory.link || "");
      setActionDocuments(dormitory.documents || []);
      setActionType(dormitory.documents?.length > 0 ? "document" : "link");
    }
  }, [posts, categories]);

  const handleSelectPage = (dormitoryId, categoryId) => {
    const dormitory = posts.find((d) => d.id === dormitoryId);
    if (!dormitory) return;
    setEditingNatjecajDokument(false);
    setPage(dormitoryId);
    setCategory(categoryId);
    setImage(dormitory.imageId);
    setTitle(dormitory.title);
    setExcerpt(dormitory.excerpt);
    setContent(dormitory.content);
    setSadrzaj(dormitory.sadrzaj);
    setSadrzajEn(dormitory.sadrzaj_en || "");
    setKontakt(dormitory.kontakt);
    setRadnoVrijemeBlagajni(dormitory.radno_vrijeme_blagajni);
    setLokacija(dormitory.lokacija);
    setImageGroups(dormitory.image_groups || []);
    setStatus(dormitory.status == "publish");
    setActionTitle(dormitory.actionTitle || "");
    setActionLink(dormitory.link || "");
    setActionDocuments(dormitory.documents || []);
    setActionType(dormitory.documents?.length > 0 ? "document" : "link");
  };

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreateDormitory = () => {
    createPost(
      {
        title: dialogTitle,
        categories: [adminSmjestajCategory, category],
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setEditingNatjecajDokument(false);
          setAddPostDialog(false);
          setDialogTitle("");
          setPage(data.id);
        },
        onError: (err) => {
          console.log("err", err.response.data);
        },
      },
    );
  };

  const handleUpdateDormitory = () => {
    const dormitory = posts.find((d) => d.id === page);
    updatePost(
      {
        id: page,
        title: title,
        excerpt: excerpt,
        content: content,
        sadrzaj: sadrzaj,
        sadrzajEn: sadrzajEn,
        kontakt: kontakt,
        radno_vrijeme_blagajni: radnoVrijemeBlagajni,
        lokacija: lokacija !== dormitory.lokacija ? lokacija : undefined,
        image_groups: imageGroups,
        status: dormitory?.categories?.includes(infoSmjestajNatjecajCategory)
          ? status
            ? "publish"
            : "draft"
          : "publish",
        actionTitle,
        link: actionType === "link" ? actionLink : "",
        documents:
          actionType === "document" &&
          actionDocuments.map((file) => ({
            id: file.id,
            title: file.title,
            media_type: file.mediaType || file.media_type,
            mime_type: file.mimeType || file.mime_type,
            source_url: file.src || file.source_url,
          })),
        ...(image ? { featuredMedia: image } : {}),
      },
      {
        onError: (err) => {},
      },
    );
  };

  const handleSaveNatjecajDokument = () => {
    const documents =
      natjecajDocuments.length > 0 &&
      natjecajDocuments.map((file) => ({
        id: file.id,
        title: file.title,
        media_type: file.mediaType || file.media_type,
        mime_type: file.mimeType || file.mime_type,
        source_url: file.src || file.source_url,
      }));

    if (natjecajDokumentPost) {
      updatePost({
        id: natjecajDokumentPost.id,
        title: natjecajTitle,
        excerpt: natjecajOpis,
        status: "publish",
        slug: smjestajNatjecajDokumentSlug,
        documents,
      });
    } else {
      createPost({
        title: natjecajTitle,
        excerpt: natjecajOpis,
        categories: [adminSmjestajCategory],
        status: "publish",
        documents,
        slug: smjestajNatjecajDokumentSlug,
      });
    }
  };

  const handleDeleteDormitory = () => {
    deletePost(
      {
        id: page,
      },
      {
        onSuccess: () => {
          setDeletePostDialog(false);
          setPage(0);
        },
      },
    );
  };

  return (
    <Layout>
      <Header title="Početna" localeToggle />
      <div className="px-5 md:px-10 pb-6">
        <div className="flex gap-10 flex-wrap md:flex-nowrap">
          <div>
            {isLoadingCategories || isLoadingPosts ? (
              <div className="flex items-center justify-center py-2">
                <CircularProgress size={24} />
              </div>
            ) : isCategoriesError || isPostsError ? (
              <div className="flex flex-col text-error my-2 px-4">
                Greška kod učitavanja
                <LoadingButton
                  variant="outlined"
                  className="mt-4"
                  onClick={() => refetchPosts()}
                  loading={isRefetchingPosts}
                >
                  Pokušaj ponovno
                </LoadingButton>
              </div>
            ) : [...posts, ...categories].length <= 0 ? (
              <div className="text-gray-500 my-2 px-4">
                Nema informacija za prikaz
              </div>
            ) : (
              categories?.map((category) => (
                <div key={category.id} className="mb-6">
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
                    <MenuList>
                      {category.id === infoSmjestajNatjecajCategory && (
                        <MenuItem
                          selected={editingNatjecajDokument}
                          onClick={() => setEditingNatjecajDokument(true)}
                        >
                          <ListItemText className="line-clamp-1 font-semibold">
                            Dokument natječaja
                          </ListItemText>
                        </MenuItem>
                      )}
                      {posts?.filter((post) =>
                        post.categories.includes(category.id),
                      ).length <= 0 ? (
                        <div className="px-4">Nema informacija za prikaz</div>
                      ) : (
                        posts
                          ?.filter((post) =>
                            post.categories.includes(category.id),
                          )
                          ?.map((post) => (
                            <MenuItem
                              key={post.id}
                              selected={
                                !editingNatjecajDokument && page === post.id
                              }
                              onClick={() =>
                                handleSelectPage(post.id, category.id)
                              }
                            >
                              {post.status === "draft" && (
                                <Tooltip
                                  title="Još nije vidljivo na stranici."
                                  arrow
                                >
                                  <ListItemIcon>
                                    <FontAwesomeIcon
                                      icon={faTriangleExclamation}
                                      className="text-error"
                                    />
                                  </ListItemIcon>
                                </Tooltip>
                              )}
                              <ListItemText className="line-clamp-1">
                                <QuillTextEditor
                                  value={post.title}
                                  useToolbar={false}
                                  className="[&>div>div>p]:hover:cursor-pointer [&>div>div]:line-clamp-1"
                                  readOnly
                                  includeStyles={false}
                                />
                              </ListItemText>
                            </MenuItem>
                          ))
                      )}
                    </MenuList>
                  </Paper>
                  {category.id != infoSmjestajNatjecajCategory ? (
                    <LoadingButton
                      className="!mt-2"
                      startIcon={<FontAwesomeIcon icon={faPlus} />}
                      onClick={() => {
                        setEditingNatjecajDokument(false);
                        setAddPostDialog(true);
                        setCategory(category.id);
                      }}
                    >
                      Dodaj novi
                    </LoadingButton>
                  ) : null}
                </div>
              ))
            )}
          </div>
          <div className="flex-1">
            {editingNatjecajDokument ? (
              <>
                <h3 className="font-semibold mt-4 mb-2">Naslov</h3>
                <QuillTextEditor
                  value={natjecajTitle}
                  onChange={setNatjecajTitle}
                  formats={[]}
                  className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
                  placeholder="Unesi naslov..."
                  useToolbar={false}
                />

                <h3 className="font-semibold mt-4 mb-2">Opis</h3>
                <QuillTextEditor
                  value={natjecajOpis}
                  onChange={setNatjecajOpis}
                  placeholder="Unesi opis..."
                />

                <h3 className="font-semibold mt-4 mb-2">Dokument (PDF)</h3>
                <button
                  type="button"
                  className="w-full p-4 bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60 text-left"
                  onClick={() => setNatjecajMediaDialog(true)}
                >
                  {natjecajDocuments?.[0]
                    ? "Zamijeni datoteku"
                    : "Odaberi datoteku"}
                </button>
                {natjecajDocuments?.[0] && (
                  <div className="flex items-center justify-between gap-2 border border-gray-300 p-2 rounded-lg mt-2">
                    <a
                      href={
                        natjecajDocuments[0].src ||
                        natjecajDocuments[0].source_url
                      }
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <FontAwesomeIcon
                        icon={getIconByMimeType(
                          natjecajDocuments[0].mimeType ||
                            natjecajDocuments[0].mime_type,
                        )}
                        className="text-lg text-gray-700"
                      />
                      <span className="line-clamp-1 break-all">
                        {(
                          natjecajDocuments[0].src ||
                          natjecajDocuments[0].source_url
                        )
                          ?.split("/")
                          .pop()}
                      </span>
                    </a>
                    <Button
                      color="error"
                      onClick={() => setNatjecajDocuments([])}
                    >
                      Ukloni
                    </Button>
                  </div>
                )}

                <div className="mt-6">
                  <LoadingButton
                    variant="contained"
                    className="!bg-primary"
                    onClick={handleSaveNatjecajDokument}
                    loading={isCreating || isUpdating}
                  >
                    Spremi
                  </LoadingButton>
                </div>
              </>
            ) : (
              <>
                {(categories?.find((post) => post.id === category)?.slug ===
                  "studentski-dom" ||
                  category === infoSmjestajTogglesCategory ||
                  category === infoSmjestajCardsCategory) && (
                  <>
                    <h3 className="font-semibold">Slika</h3>
                    <SelectMediaInput
                      defaultValue={posts?.find((d) => d.id === page)?.image}
                      onChange={setImage}
                      className="md:!w-1/2 !w-full !bg-transparent border-gray-200"
                      mediaCategoryId={smjestajCategoryId}
                    />
                  </>
                )}
                <h3 className="font-semibold mt-4 mb-2">Naziv</h3>
                <QuillTextEditor
                  value={title}
                  onChange={setTitle}
                  formats={[]}
                  className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
                  placeholder="Unesi naslov..."
                  useToolbar={false}
                />

                {category !== infoSmjestajTogglesCategory &&
                  category !== infoSmjestajCardsCategory && (
                    <>
                      <h3 className="font-semibold mt-4 mb-2">Opis</h3>
                      <QuillTextEditor
                        value={excerpt}
                        onChange={setExcerpt}
                        placeholder="Unesi opis..."
                        mediaCategoryId={smjestajCategoryId}
                      />
                    </>
                  )}

                {categories?.find((post) => post.id === category)?.slug ===
                "studentski-dom" ? (
                  <>
                    <h3 className="font-semibold mt-4 mb-2">Sadržaj</h3>
                    <LocalizedField
                      as={QuillTextEditor}
                      label="Sadržaj"
                      value={sadrzaj}
                      onChange={setSadrzaj}
                      valueEn={sadrzajEn}
                      onChangeEn={setSadrzajEn}
                      placeholder="Unesi sadržaj..."
                      mediaCategoryId={smjestajCategoryId}
                    />

                    <h3 className="font-semibold mt-4 mb-2">Kontakt</h3>
                    <QuillTextEditor
                      value={kontakt}
                      onChange={setKontakt}
                      placeholder="Unesi kontakt..."
                      mediaCategoryId={smjestajCategoryId}
                    />

                    <h3 className="font-semibold mt-4 mb-2">
                      Radno vrijeme blagajni
                    </h3>
                    <QuillTextEditor
                      value={radnoVrijemeBlagajni}
                      onChange={setRadnoVrijemeBlagajni}
                      placeholder="Unesi radno vrijeme blagajni..."
                      mediaCategoryId={smjestajCategoryId}
                    />

                    <h3 className="font-semibold mt-4 mb-2">Grupe slika</h3>
                    <ReorderImages
                      imageGroups={imageGroups}
                      setImageGroups={setImageGroups}
                      mediaCategoryId={smjestajCategoryId}
                    />

                    <h3 className="font-semibold mt-4 mb-2">Lokacija</h3>
                    <EditLocation value={lokacija} onChange={setLokacija} />
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold mt-4 mb-2">Sadržaj</h3>
                    <QuillTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Unesi sadržaj..."
                      mediaCategoryId={smjestajCategoryId}
                    />
                  </>
                )}
                {category === infoSmjestajCardsCategory && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Tekst gumba akcije</h3>
                    <TextField
                      variant="outlined"
                      className="w-full"
                      value={actionTitle}
                      onChange={(e) => setActionTitle(e.target.value)}
                      placeholder="npr. Saznaj više"
                    />

                    <h3 className="font-semibold mt-4 mb-2">
                      Akcija gumba
                    </h3>
                    <RadioGroup
                      row
                      value={actionType}
                      onChange={(e) => setActionType(e.target.value)}
                    >
                      <FormControlLabel
                        value="link"
                        control={<Radio />}
                        label="Poveznica"
                      />
                      <FormControlLabel
                        value="document"
                        control={<Radio />}
                        label="Dokument"
                      />
                    </RadioGroup>

                    {actionType === "link" ? (
                      <TextField
                        variant="outlined"
                        className="w-full"
                        value={actionLink}
                        onChange={(e) => setActionLink(e.target.value)}
                        placeholder="npr. /smjestaj/placanje-stanarine-on-line-putem"
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          className="w-full p-4 bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60 text-left"
                          onClick={() => setCardMediaDialog(true)}
                        >
                          {actionDocuments?.[0]
                            ? "Zamijeni datoteku"
                            : "Odaberi datoteku"}
                        </button>
                        {actionDocuments?.[0] && (
                          <div className="flex items-center justify-between gap-2 border border-gray-300 p-2 rounded-lg mt-2">
                            <a
                              href={
                                actionDocuments[0].src ||
                                actionDocuments[0].source_url
                              }
                              target="_blank"
                              rel="noreferrer noopener"
                              className="flex items-center gap-2 flex-1 min-w-0"
                            >
                              <FontAwesomeIcon
                                icon={getIconByMimeType(
                                  actionDocuments[0].mimeType ||
                                    actionDocuments[0].mime_type,
                                )}
                                className="text-lg text-gray-700"
                              />
                              <span className="line-clamp-1 break-all">
                                {(
                                  actionDocuments[0].src ||
                                  actionDocuments[0].source_url
                                )
                                  ?.split("/")
                                  .pop()}
                              </span>
                            </a>
                            <Button
                              color="error"
                              onClick={() => setActionDocuments([])}
                            >
                              Ukloni
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {category == infoSmjestajNatjecajCategory ? (
                  <FormControlLabel
                    label="Prikaži na stranici"
                    sx={{ mt: 2 }}
                    control={
                      <Checkbox
                        checked={status}
                        onChange={(e) => setStatus(e.target.checked)}
                      />
                    }
                  />
                ) : null}

                <div className="flex gap-2 items-center mt-6">
                  <LoadingButton
                    variant="contained"
                    loading={isUpdating}
                    onClick={handleUpdateDormitory}
                    className="!bg-primary"
                  >
                    Spremi
                  </LoadingButton>
                  {category != infoSmjestajNatjecajCategory ? (
                    <LoadingButton
                      variant="outlined"
                      color="error"
                      onClick={() => setDeletePostDialog(true)}
                    >
                      Obriši
                    </LoadingButton>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={deletePostDialog}
        onClose={() => setDeletePostDialog(false)}
      >
        <DialogTitle>Brisanje doma</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ovime se briše stranica i link na strnicu sadržaja. Radnja se ne
            može poništiti.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeletePostDialog(false)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton
            color="error"
            onClick={handleDeleteDormitory}
            loading={isDeleting}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!addPostDialog}
        onClose={() => {
          setAddPostDialog(null);
          setDialogTitle("");
        }}
      >
        <DialogTitle>Dodaj novi</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bit će vidljivo na stranici tek nakon što uredite sadržaj i spremite
            promjene.
          </DialogContentText>
          <QuillTextEditor
            value={dialogTitle}
            onChange={setDialogTitle}
            formats={["bold"]}
            containerClassName="mt-2"
            className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
            placeholder="Naslov"
            useToolbar={false}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddPostDialog(null);
              setDialogTitle("");
            }}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton onClick={handleCreateDormitory} loading={isCreating}>
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <MediaSelectDialog
        opened={natjecajMediaDialog}
        onClose={() => setNatjecajMediaDialog(false)}
        onSelect={(media) => setNatjecajDocuments([media])}
        categoryId={smjestajCategoryId}
        mediaType="application"
      />

      <MediaSelectDialog
        opened={cardMediaDialog}
        onClose={() => setCardMediaDialog(false)}
        onSelect={(media) => setActionDocuments([media])}
        categoryId={smjestajCategoryId}
        mediaType="application"
      />
    </Layout>
  );
};

export default Home;

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import dynamic from "next/dynamic";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);
import {
  adminPocetnaCategory,
  pagesPocetnaAdminCategoryId,
  pocetnaOglasZaPopunuRadnihMjestaPost,
  pocetnaOpceInformacijePost,
  pocetnaStranicaCategoryId,
} from "../../lib/constants";
import {
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "../../features/posts";
import { LoadingButton } from "@mui/lab";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/pro-regular-svg-icons";
import MediaSelectDialog from "../../components/MediaSelectDialog";
import getIconByMimeType from "../../lib/getIconbyMimeType";

const PocetnaStranica = () => {
  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({
    include: [pocetnaOpceInformacijePost, pocetnaOglasZaPopunuRadnihMjestaPost],
  });

  const {
    data: pages,
    isInitialLoading: isLoadingPages,
    isError: isPagesError,
    isRefetching: isRefetchingPages,
    refetch: refetchPages,
  } = usePosts({
    categories: [adminPocetnaCategory, pagesPocetnaAdminCategoryId],
  });

  const [page, setPage] = useState(pocetnaOpceInformacijePost);

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  const [addPostDialog, setAddPostDialog] = useState(false);
  const [deletePostDialog, setDeletePostDialog] = useState(false);

  const [dialogTitle, setDialogTitle] = useState("");

  useEffect(() => {
    if (posts) {
      const post = [
        pocetnaOpceInformacijePost,
        pocetnaOglasZaPopunuRadnihMjestaPost,
      ].includes(page)
        ? posts?.find((post) => post.id === page)
        : pages?.find((post) => post.id === page);
      if (!post) return;
      setSlug(post.slug);
      setTitle(post.title);
      setExcerpt(post.sadrzaj);
      setContent(post.content);
      setFiles(post.documents || []);
    }
  }, [posts, pages, page]);

  const handleSelectPage = (postId) => {
    const post = [
      pocetnaOpceInformacijePost,
      pocetnaOglasZaPopunuRadnihMjestaPost,
    ].includes(postId)
      ? posts?.find((post) => post.id === postId)
      : pages?.find((post) => post.id === postId);
    if (!post) return;
    setPage(postId);
    setSlug(post.slug);
    setTitle(post.title);
    setExcerpt(post.sadrzaj);
    setContent(post.content);
    setFiles(post.documents || []);
  };

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreatePost = () => {
    createPost(
      {
        title: dialogTitle,
        categories: [adminPocetnaCategory, pagesPocetnaAdminCategoryId],
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setAddPostDialog(null);
          setDialogTitle("");
          setPage(data.id);
        },
      }
    );
  };

  const handleSavePost = () => {
    if (!page) return;
    updatePost({
      id: page,
      title,
      sadrzaj: page === pocetnaOpceInformacijePost ? excerpt : undefined,
      excerpt: "<p></p>",
      content,
      status: "publish",
      documents:
        files.length > 0 &&
        files.map((file) => ({
          id: file.id,
          title: file.title,
          media_type: file.mediaType || file.media_type,
          mime_type: file.mimeType || file.mime_type,
          source_url: file.src || file.source_url,
        })),
    });
  };

  const handleDeletePost = () => {
    deletePost(
      { id: page },
      {
        onSuccess: () => {
          setDeletePostDialog(false);
        },
      }
    );
  };

  const [mediaDialog, setMediaDialog] = useState(false);

  const handleSelectMedia = (media) => {
    setFiles((files) => [...files, media]);
  };

  return (
    <Layout>
      <Header title="Početna stranica" />
      <div className="flex items-start gap-10 flex-wrap md:flex-nowrap px-5 md:px-10 pb-6">
        <div className="flex flex-col">
          <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
            <MenuList>
              {isLoadingPosts ? (
                <div className="w-full flex items-center justify-center">
                  <CircularProgress size={32} />
                </div>
              ) : isPostsError ? (
                <div className="w-full flex flex-col gap-6 items-center justify-center text-center">
                  <span className="text-error">Greška kod dohvaćanja</span>
                  <LoadingButton
                    loading={isRefetchingPosts}
                    onClick={refetchPosts}
                    variant="outlined"
                  >
                    Pokušaj ponovno
                  </LoadingButton>
                </div>
              ) : (
                posts.map((post) => (
                  <MenuItem
                    key={post.id}
                    onClick={() => handleSelectPage(post.id)}
                    selected={page === post.id}
                  >
                    <QuillTextEditor
                      value={post.title}
                      containerClassName="!bg-transparent border-none"
                      className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1 [&>div>div>p]:hover:cursor-pointer"
                      readOnly
                    />
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Paper>
          <h3 className="mt-8 mb-2">Stranice</h3>
          <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
            <MenuList>
              {isLoadingPages ? (
                <div className="w-full flex items-center justify-center">
                  <CircularProgress size={32} />
                </div>
              ) : isPagesError ? (
                <div className="w-full flex flex-col gap-6 items-center justify-center text-center">
                  <span className="text-error">Greška kod dohvaćanja</span>
                  <LoadingButton
                    loading={isRefetchingPages}
                    onClick={refetchPages}
                    variant="outlined"
                  >
                    Pokušaj ponovno
                  </LoadingButton>
                </div>
              ) : !pages?.length ? (
                <div className="text-center py-2 text-gray-600">
                  Nema stranica za prikaz
                </div>
              ) : (
                pages.map((post) => (
                  <MenuItem
                    key={post.id}
                    selected={page === post.id}
                    onClick={() => handleSelectPage(post.id)}
                  >
                    {post.status === "draft" && (
                      <Tooltip title="Još nije vidljivo na stranici." arrow>
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
                        containerClassName="!bg-transparent border-none"
                        className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1 [&>div>div>p]:hover:cursor-pointer"
                        readOnly
                      />
                    </ListItemText>
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Paper>
          <LoadingButton
            className="mt-2 self-start"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={() => setAddPostDialog(true)}
          >
            Dodaj novu
          </LoadingButton>
        </div>
        <div className="w-full">
          <div className="flex flex-col items-start gap-4 w-full">
            <div className="w-full">
              {![
                pocetnaOpceInformacijePost,
                pocetnaOglasZaPopunuRadnihMjestaPost,
              ].includes(page) &&
                !!slug && (
                  <>
                    <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                      Poveznica na stranicu
                    </h4>
                    <div className="py-2 px-4 bg-gray-100 rounded-lg w-fit mb-6">
                      http://www.sczg.unizg.hr/informacije/{slug}
                    </div>
                  </>
                )}
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Naslov
              </h4>
              <QuillTextEditor
                value={title}
                onChange={setTitle}
                formats={["bold"]}
                className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
                placeholder="Unesi naslov..."
                useToolbar={false}
              />
            </div>
            {page === pocetnaOpceInformacijePost && (
              <div className="w-full">
                <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                  Kratki opis
                </h4>
                <QuillTextEditor
                  value={excerpt}
                  onChange={setExcerpt}
                  className="[&>div>div]:!min-h-[100px]"
                  placeholder="Unesi kratki opis..."
                />
              </div>
            )}
            {page !== pocetnaOglasZaPopunuRadnihMjestaPost && (
              <div className="w-full">
                <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                  Sadržaj
                </h4>
                <QuillTextEditor
                  value={content}
                  onChange={setContent}
                  files={files}
                  mediaCategoryId={pocetnaStranicaCategoryId}
                  setFiles={setFiles}
                  placeholder="Unesi sadržaj..."
                />
              </div>
            )}
            {page === pocetnaOglasZaPopunuRadnihMjestaPost && (
              <div className="w-full">
                <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                  OGLASI
                </h4>
                <button
                  className="w-full p-4 bg-secondary rounded-lg border border-black/20 hover:border-black text-black/60"
                  onClick={() => setMediaDialog(true)}
                >
                  Odaberi datoteku
                </button>
                <div className={"flex flex-col gap-2 mt-2"}>
                  {files.map((file, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <TextField
                        label="Naziv"
                        fullWidth
                        value={files[index].title}
                        onChange={(e) => {
                          const newFiles = [...files];
                          newFiles[index].title = e.target.value;
                          setFiles(newFiles);
                        }}
                      />
                      <a
                        href={file.src || file.source_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex !my-2 py-3 items-center justify-between gap-2 border border-gray-400 p-1 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={getIconByMimeType(
                              file.mimeType || file.mime_type
                            )}
                            className="text-lg text-gray-800 ml-2"
                          />
                          <div className="flex-1 line-clamp-1 break-all">
                            {(file.src || file.source_url).split("/").pop()}
                          </div>
                        </div>
                      </a>
                      <Button
                        variant="text"
                        color="error"
                        onClick={() => {
                          const newFiles = [...files];
                          newFiles.splice(index, 1);
                          setFiles(newFiles);
                        }}
                      >
                        Obriši
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex !gap-4 mt-6">
            <LoadingButton
              variant="contained"
              className="!bg-primary"
              onClick={handleSavePost}
              loading={isUpdating}
            >
              Spremi
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              color="error"
              onClick={() => setDeletePostDialog(true)}
            >
              Obriši
            </LoadingButton>
          </div>
        </div>
      </div>

      <Dialog
        open={addPostDialog}
        onClose={() => {
          setAddPostDialog(false);
          setDialogTitle("");
        }}
      >
        <DialogTitle>Dodaj novo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bit će vidljivo na stranici tek nakon što uredite i spremite
            promjene.
          </DialogContentText>
          <QuillTextEditor
            value={dialogTitle}
            onChange={setDialogTitle}
            useToolbar={false}
            containerClassName="mt-2"
            formats={[]}
            className="[&>div>div]:!min-h-fit"
            placeholder="Naslov"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddPostDialog(false)}
            className="!text-black"
          >
            Odustani
          </Button>
          <LoadingButton onClick={handleCreatePost} loading={isCreating}>
            Dodaj
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deletePostDialog}
        onClose={() => setDeletePostDialog(false)}
      >
        <DialogTitle>Brisanje sadržaja</DialogTitle>
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
            onClick={handleDeletePost}
            loading={isDeleting}
          >
            Obriši
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <MediaSelectDialog
        opened={!!mediaDialog}
        onClose={() => setMediaDialog(false)}
        onSelect={handleSelectMedia}
        categoryId={pocetnaStranicaCategoryId}
        mediaType="application"
      />
    </Layout>
  );
};

export default PocetnaStranica;

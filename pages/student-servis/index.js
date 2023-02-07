import {
  faPlus,
  faTriangleExclamation,
} from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import {
  useCreatePost,
  useDeletePost,
  usePosts,
  useUpdatePost,
} from "../../features/posts";
import {
  aboutUsPostId,
  adminStudentServisCategory,
  faqStudentServisCategoryId,
  poslovniceCategoryId,
  studentskiServisCategoryId,
  userGroups,
} from "../../lib/constants";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";

const Poslovi = () => {
  const router = useRouter();

  const {
    data: aboutUs,
    isLoading: isLoadingAboutUs,
    isError: isAboutUsError,
    isRefetching: isRefetchingAboutUs,
    refetch: refetchAboutUs,
  } = usePosts({
    categories: adminStudentServisCategory,
    include: aboutUsPostId,
  });

  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({
    categories: adminStudentServisCategory,
    categories_exclude: [poslovniceCategoryId, faqStudentServisCategoryId],
    exclude: aboutUsPostId,
  });

  const {
    data: poslovnice,
    isLoading: isLoadingPoslovnice,
    isError: isPoslovniceError,
    isRefetching: isRefetchingPoslovnice,
    refetch: refetchPoslovnice,
  } = usePosts({
    categories: poslovniceCategoryId,
  });

  const [page, setPage] = useState(aboutUsPostId);

  const [addPostDialog, setAddPostDialog] = useState(null);
  const [deletePostDialog, setDeletePostDialog] = useState(false);

  const [dialogTitle, setDialogTitle] = useState("");

  const [mediaId, setMediaId] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    const username = window.localStorage.getItem("username");

    if (!token || !userGroups["student-servis"].includes(username))
      router.push("/student-servis/login");
  }, [router]);

  useEffect(() => {
    if (aboutUs && posts && poslovnice) {
      const post =
        [...(posts || []), ...(poslovnice || [])].find(
          (post) => post.id === page
        ) ||
        aboutUs?.[0] ||
        posts?.[0] ||
        poslovnice?.[0];
      if (!post) return;
      setPage(post.id);
      setMediaId(post.imageId);
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setFiles(post.documents || []);
    }
  }, [aboutUs, posts, poslovnice]);

  const handleSelectPage = (id) => {
    let post = null;
    if (id === aboutUsPostId) post = aboutUs[0];
    else post = [...posts, ...poslovnice].find((post) => post.id === id);
    if (!post) return;
    setPage(id);
    setTitle(post.title);
    setMediaId(post.imageId);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setFiles(post.documents || []);
  };

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreatePost = () => {
    const categories = [adminStudentServisCategory];
    createPost(
      {
        title: dialogTitle,
        categories:
          addPostDialog === "informacija"
            ? categories
            : [...categories, poslovniceCategoryId],
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
    updatePost({
      id: page,
      title,
      excerpt,
      content,
      status: "publish",
      featuredMedia: mediaId,
      documents:
        files.length > 0 &&
        files.map((file) => ({
          id: file.id,
          title: file.title,
          media_type: file.mediaType,
          mime_type: file.mimeType,
          source_url: file.src,
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

  // if (isPageError)
  //   return (
  //     <Layout>
  //       <Header title="Početna" />
  //       <div className="px-5 md:px-10 pb-6">
  //         <div className="text-error py-10">Greška kod dohvaćanja podataka</div>
  //       </div>
  //     </Layout>
  //   );

  // if (isLoadingPage)
  //   return (
  //     <Layout>
  //       <Header title="Početna" />
  //       <div className="flex items-center justify-center py-10">
  //         <Loader className="w-10 h-10 border-primary" />
  //       </div>
  //     </Layout>
  //   );

  return (
    <Layout>
      <Header title="Početna" />
      <div className="px-5 md:px-10 pb-6">
        <div className="flex gap-10 flex-wrap md:flex-nowrap">
          <div>
            {/* ************************ O NAMA ******************************* */}
            <h3 className="font-semibold mb-2">O nama</h3>
            <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
              <MenuList>
                {isLoadingAboutUs ? (
                  <div className="flex items-center justify-center py-2">
                    <CircularProgress size={24} />
                  </div>
                ) : isAboutUsError ? (
                  <div className="text-error my-2 px-4">
                    Greška kod učitavanja
                    <LoadingButton
                      variant="outlined"
                      className="mt-4"
                      onClick={() => refetchAboutUs()}
                      loading={isRefetchingAboutUs}
                    >
                      Pokušaj ponovno
                    </LoadingButton>
                  </div>
                ) : aboutUs.length <= 0 ? (
                  <div className="text-gray-500 my-2 px-4">
                    Nije pronađen post &quot;O nama&quot;
                  </div>
                ) : (
                  <MenuItem
                    selected={page === aboutUsPostId}
                    onClick={() => handleSelectPage(aboutUsPostId)}
                  >
                    <ListItemText className="line-clamp-1">
                      <QuillTextEditor
                        value={aboutUs[0].title}
                        containerClassName="!bg-transparent border-none"
                        className="[&>div>div]:p-0 [&>div>div]:!min-h-fit [&>div>div]:line-clamp-1 [&>div>div>p]:hover:cursor-pointer"
                        readOnly
                      />
                    </ListItemText>
                  </MenuItem>
                )}
              </MenuList>
            </Paper>
            {/* ************************ POSTOVI ******************************* */}
            <h3 className="font-semibold mb-2 mt-6">Informacije</h3>
            <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
              <MenuList>
                {isLoadingPosts ? (
                  <div className="flex items-center justify-center py-2">
                    <CircularProgress size={24} />
                  </div>
                ) : isPostsError ? (
                  <div className="text-error my-2 px-4">
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
                ) : posts.length <= 0 ? (
                  <div className="text-gray-500 my-2 px-4">
                    Nema informacija za prikaz
                  </div>
                ) : (
                  posts?.map((post) => (
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
              className="mt-2"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => setAddPostDialog("informacija")}
            >
              Dodaj novo
            </LoadingButton>
            {/* ************************ POSLOVNICE ******************************* */}
            <h3 className="font-semibold mb-2 mt-6">Poslovnice</h3>
            <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
              <MenuList>
                {isLoadingPoslovnice ? (
                  <div className="flex items-center justify-center py-2">
                    <CircularProgress size={24} />
                  </div>
                ) : isPoslovniceError ? (
                  <div className="text-error my-2 px-4">
                    Greška kod učitavanja
                    <LoadingButton
                      variant="outlined"
                      className="mt-4"
                      onClick={() => refetchPoslovnice()}
                      loading={isRefetchingPoslovnice}
                    >
                      Pokušaj ponovno
                    </LoadingButton>
                  </div>
                ) : poslovnice.length <= 0 ? (
                  <div className="text-gray-500 my-2 px-4">
                    Nema poslovnica za prikaz
                  </div>
                ) : (
                  poslovnice?.map((post) => (
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
              className="mt-2"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => setAddPostDialog("poslovnica")}
            >
              Dodaj novu
            </LoadingButton>
          </div>
          <div className="flex flex-col items-start gap-4 w-full">
            {page === aboutUsPostId && (
              <div className="w-full">
                <h4 className="uppercase text-sm font-semibold tracking-wide">
                  Slika
                </h4>
                <SelectMediaInput
                  defaultValue={aboutUs?.[0]?.image}
                  onChange={setMediaId}
                  className="w-1/2"
                  mediaCategoryId={studentskiServisCategoryId}
                />
              </div>
            )}
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Naslov
              </h4>
              <QuillTextEditor
                value={title}
                onChange={setTitle}
                useToolbar={false}
                className="[&>div>div]:!min-h-fit"
                placeholder="Unesi naslov..."
              />
            </div>
            {page !== aboutUsPostId &&
              ![...(posts || []), ...(poslovnice || [])]
                .find((post) => post.id === page)
                ?.categories?.includes(poslovniceCategoryId) && (
                <div className="w-full">
                  <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                    Kratki opis
                  </h4>
                  <QuillTextEditor
                    value={excerpt}
                    onChange={setExcerpt}
                    useToolbar={false}
                    className="[&>div>div]:!min-h-[100px]"
                    placeholder="Unesi kratki opis..."
                  />
                </div>
              )}
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Sadržaj
              </h4>
              <QuillTextEditor
                value={content}
                onChange={setContent}
                files={files}
                setFiles={setFiles}
                placeholder="Unesi sadržaj..."
              />
            </div>
            <div className="flex !gap-4">
              <LoadingButton
                variant="contained"
                className="!bg-primary"
                onClick={handleSavePost}
                loading={isUpdating}
              >
                Spremi
              </LoadingButton>
              {page !== aboutUsPostId && (
                <LoadingButton
                  variant="outlined"
                  color="error"
                  onClick={() => setDeletePostDialog(true)}
                >
                  Obriši
                </LoadingButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={!!addPostDialog}
        onClose={() => {
          setAddPostDialog(null);
          setDialogTitle("");
        }}
      >
        <DialogTitle>
          {addPostDialog === "informacija"
            ? "Dodaj sadržaj"
            : "Dodaj poslovnicu"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bit će vidljivo na stranici tek nakon što uredite sadržaj i spremite
            promjene.
          </DialogContentText>
          <QuillTextEditor
            value={dialogTitle}
            onChange={setDialogTitle}
            useToolbar={false}
            containerClassName="mt-2"
            className="[&>div>div]:!min-h-fit"
            placeholder="Naslov"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddPostDialog(null)}
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
    </Layout>
  );
};

export default Poslovi;

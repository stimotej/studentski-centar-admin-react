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
  TextField,
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
import { adminStudentServisCategory, userGroups } from "../../lib/constants";

const Poslovi = () => {
  const router = useRouter();

  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({ category: adminStudentServisCategory });

  const [page, setPage] = useState(null);

  const [addPostDialog, setAddPostDialog] = useState(false);
  const [deletePostDialog, setDeletePostDialog] = useState(false);

  const [dialogTitle, setDialogTitle] = useState("");

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
    if (posts) {
      const post = posts.find((post) => post.id === page) || posts[0];
      setPage(post.id);
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setFiles(post.documents || []);
    }
  }, [posts]);

  const handleSelectPage = (id) => {
    setPage(id);
    setTitle(posts.find((post) => post.id === id).title);
    setExcerpt(posts.find((post) => post.id === id).excerpt);
    setContent(posts.find((post) => post.id === id).content);
    setFiles(posts.find((post) => post.id === id).documents || []);
    console.log(
      "post: ",
      posts.find((post) => post.id === id)
    );
  };

  const { mutate: createPost, isLoading: isCreating } = useCreatePost();
  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();
  const { mutate: deletePost, isLoading: isDeleting } = useDeletePost();

  const handleCreatePost = () => {
    createPost(
      {
        title: dialogTitle,
        category: adminStudentServisCategory,
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setAddPostDialog(false);
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
      documents:
        files.length > 0 &&
        files.map((file) => ({
          id: file.id,
          title: file.title,
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
                        {post.title}
                      </ListItemText>
                    </MenuItem>
                  ))
                )}
              </MenuList>
            </Paper>
            <LoadingButton
              className="mt-6"
              startIcon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => setAddPostDialog(true)}
            >
              Dodaj novo
            </LoadingButton>
          </div>
          <div className="flex flex-col items-start gap-6 w-full">
            <TextField
              className="w-full"
              label="Naslov"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              className="w-full"
              label="Kratki opis"
              multiline
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
            <QuillTextEditor
              value={content}
              onChange={setContent}
              files={files}
              setFiles={setFiles}
              placeholder="Sadržaj"
            />
            <div className="flex !gap-4">
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
      </div>

      <Dialog
        open={addPostDialog}
        onClose={() => {
          setAddPostDialog(false);
          setDialogTitle("");
        }}
      >
        <DialogTitle>Dodaj sadržaj</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bit će vidljivo na stranici tek nakon što uredite sadržaj i spremite
            promjene.
          </DialogContentText>
          <TextField
            value={dialogTitle}
            onChange={(e) => setDialogTitle(e.target.value)}
            margin="dense"
            label="Naslov"
            type="text"
            fullWidth
            variant="outlined"
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
    </Layout>
  );
};

export default Poslovi;

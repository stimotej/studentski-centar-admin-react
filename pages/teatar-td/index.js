import { CircularProgress, MenuItem, MenuList, Paper } from "@mui/material";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import { usePosts, useUpdatePost } from "../../features/posts";
import { LoadingButton } from "@mui/lab";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  teatarTDCategoryId,
  teatarTdONamaPost,
  teatarTdProdajaUlaznicaPost,
} from "../../lib/constants";
import SelectMediaInput from "../../components/Elements/SelectMediaInput";

const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

const PocetnaStranica = () => {
  const [page, setPage] = useState(teatarTdProdajaUlaznicaPost);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [files, setFiles] = useState([]);

  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({
    include: [teatarTdProdajaUlaznicaPost, teatarTdONamaPost],
  });

  const isDataSetForTheFirstTime = useRef(false);

  const handleSelectPage = useCallback(
    (postId) => {
      const post = posts?.find((post) => post.id === postId);
      if (!post) return;
      setPage(postId);
      setTitle(post.title);
      setExcerpt(post.sadrzaj);
      setContent(post.content);
      setImage(post.imageId);
      setFiles(post.documents || []);
    },
    [posts]
  );

  useEffect(() => {
    if (posts && !isDataSetForTheFirstTime.current) {
      const post = posts.find((d) => d.id === page) || posts?.[0];
      if (!post) return;
      handleSelectPage(post.id);
      isDataSetForTheFirstTime.current = true;
    }
  }, [posts, page, handleSelectPage]);

  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();

  const handleSavePost = () => {
    if (!page) return;
    updatePost({
      id: page,
      title,
      sadrzaj: excerpt,
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
      ...(image ? { featuredMedia: image } : {}),
    });
  };

  return (
    <Layout>
      <Header title="Teatar &TD" />
      <div className="flex items-start gap-10 flex-wrap md:flex-nowrap px-5 md:px-10 pb-6">
        <div>
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
        </div>
        <div className="w-full">
          <div className="flex flex-col items-start gap-4 w-full">
            {page === teatarTdONamaPost && (
              <div className="w-full">
                <h3 className="font-semibold">Slika</h3>
                <SelectMediaInput
                  defaultValue={posts?.find((d) => d.id === page)?.image}
                  onChange={setImage}
                  className="!w-full md:!w-1/2 !bg-transparent border-gray-200"
                  mediaCategoryId={teatarTDCategoryId}
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
                formats={["bold"]}
                className="[&>div>div]:!min-h-fit [&>div>div]:line-clamp-1"
                placeholder="Unesi naslov..."
                useToolbar={false}
              />
            </div>
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Kratki opis
              </h4>
              <QuillTextEditor
                value={excerpt}
                onChange={setExcerpt}
                className="[&>div>div]:!min-h-[100px]"
                placeholder="Unesi kratki opis..."
                mediaCategoryId={teatarTDCategoryId}
              />
            </div>
            <div className="w-full">
              <h4 className="uppercase text-sm font-semibold tracking-wide mb-2">
                Sadržaj
              </h4>
              <QuillTextEditor
                value={content}
                onChange={setContent}
                files={files}
                mediaCategoryId={teatarTDCategoryId}
                setFiles={setFiles}
                placeholder="Unesi sadržaj..."
              />
            </div>
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PocetnaStranica;

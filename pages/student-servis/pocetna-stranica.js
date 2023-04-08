import { CircularProgress, MenuItem, MenuList, Paper } from "@mui/material";
import React from "react";
import { useState } from "react";
import { FAQList } from "../../components/FAQLayout";
import Header from "../../components/Header";
import Layout from "../../components/Layout";
import dynamic from "next/dynamic";
const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);
import {
  faqPocetnaCategoryId,
  pocetnaOpceInformacijePost,
  studentskiServisCategoryId,
} from "../../lib/constants";
import { usePosts, useUpdatePost } from "../../features/posts";
import { LoadingButton } from "@mui/lab";
import { useEffect } from "react";

const PocetnaStranica = () => {
  const {
    data: posts,
    isInitialLoading: isLoadingPosts,
    isError: isPostsError,
    isRefetching: isRefetchingPosts,
    refetch: refetchPosts,
  } = usePosts({
    include: pocetnaOpceInformacijePost,
  });

  const [addFAQModal, setAddFAQModal] = useState(false);

  const [page, setPage] = useState("info");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (posts) {
      const post = posts?.[0];
      if (!post) return;
      setTitle(post.title);
      setExcerpt(post.sadrzaj);
      setContent(post.content);
      setFiles(post.documents || []);
    }
  }, [posts]);

  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();

  const handleSavePost = () => {
    const post = posts?.[0];
    if (!post) return;
    updatePost({
      id: post.id,
      title,
      sadrzaj: excerpt,
      content,
      status: "publish",
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

  return (
    <Layout>
      <Header
        title="Početna stranica"
        text={page === "info" ? "Spremi" : "Dodaj informaciju"}
        onClick={page === "info" ? handleSavePost : () => setAddFAQModal(true)}
        loading={isUpdating}
      />
      <div className="flex items-start gap-10 flex-wrap md:flex-nowrap px-5 md:px-10 pb-6">
        <Paper className="md:!min-w-[260px] md:!max-w-[400px]">
          <MenuList>
            <MenuItem
              onClick={() => setPage("info")}
              selected={page === "info"}
            >
              Opće informacije
            </MenuItem>
            <MenuItem onClick={() => setPage("faq")} selected={page === "faq"}>
              Informacije
            </MenuItem>
          </MenuList>
        </Paper>
        <div className="w-full">
          {page === "info" ? (
            <div className="flex flex-col items-start gap-4 w-full">
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
                <>
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
                      setFiles={setFiles}
                      placeholder="Unesi sadržaj..."
                    />
                  </div>
                </>
              )}{" "}
            </div>
          ) : (
            <FAQList
              faqPageCategoryId={faqPocetnaCategoryId}
              mediaCategoryId={studentskiServisCategoryId}
              addFAQModal={addFAQModal}
              setAddFAQModal={setAddFAQModal}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PocetnaStranica;

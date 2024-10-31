import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import Header from "../../components/Header";
import { medijiPost, pocetnaStranicaCategoryId } from "../../lib/constants";
import { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { usePost, useUpdatePost } from "../../features/posts";
import { CircularProgress } from "@mui/material";

const QuillTextEditor = dynamic(
  () => import("../../components/Elements/QuillTextEditor"),
  { ssr: false }
);

export default function MedijiPage() {
  const { data, isLoading, isError, refetch, isRefetching } =
    usePost(medijiPost);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setContent(data.content);
      setFiles(data.documents);
    }
  }, [data]);

  const { mutate: updatePost, isLoading: isUpdating } = useUpdatePost();

  const handleSavePost = () => {
    updatePost({
      id: medijiPost,
      title,
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

  return (
    <Layout>
      <Header title="Mediji" />
      <div className="flex flex-col items-start gap-4 w-full px-5 md:px-10 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <CircularProgress size={24} />
          </div>
        ) : isError ? (
          <div className="flex flex-col text-error my-2 px-4">
            Greška kod učitavanja
            <LoadingButton
              variant="outlined"
              className="!mt-4 !w-fit"
              onClick={() => refetch()}
              loading={isRefetching}
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
            <LoadingButton
              variant="contained"
              className="!bg-primary"
              onClick={handleSavePost}
              loading={isUpdating}
            >
              Spremi
            </LoadingButton>
          </>
        )}
      </div>
    </Layout>
  );
}

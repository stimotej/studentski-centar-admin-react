import React from "react";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import dynamic from "next/dynamic";
import MediaFileInput from "../../components/Elements/MediaFileInput";
import PageHeader from "../../components/Header";
import Layout from "../../components/Layout";
import Header from "../../components/Obavijesti/Editor/Header";
import Loader from "../../components/Elements/Loader";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const QuillEditor = dynamic(
  () => import("../../components/Obavijesti/Editor/QuillEditor"),
  {
    ssr: false,
    loading: () => <Loader className="w-10 h-10 mt-5 mx-auto border-primary" />,
  }
);

var myToolbar = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],

  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],

  ["clean"],
  ["image"], //add image here
];

const dashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState("");

  return (
    <Layout>
      <PageHeader
        title="Kultura"
        link
        to="/kultura/uredi-event"
        text="Dodaj event"
        icon={<MdAdd />}
        primary
        responsive
      />
      <div className="px-5 sm:px-10 flex flex-col">
        <div className="flex flex-col w-full gap-2">
          <h2 className="text-lg font-semibold">Banner (vrh stranice)</h2>
          <MediaFileInput
            value={selectedFile}
            onChange={(value) => setSelectedFile(value)}
            className="!w-full border-2"
          />
        </div>
        <div>
          <Header />
          <QuillEditor
            className="w-full mt-14 sm:mt-12 text-2xl bg-transparent font-semibold border-2"
            placeholder="Sadržaj..."
            value={content}
            onChange={setContent}
          />
        </div>
        <div className="flex flex-col w-full gap-2">
          <h2 className="text-lg font-semibold">Banner (dno stranice)</h2>
          <MediaFileInput
            value={selectedFile}
            onChange={(value) => setSelectedFile(value)}
            className="!w-full border-2"
          />
        </div>
      </div>
    </Layout>
  );
};

export default dashboard;

import React from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { createMedia, useMedia } from "../lib/api/media";
import Dialog from "./Elements/Dialog";
import MediaFileInput from "./Elements/MediaFileInput";
import Tabs, { Content, Tab } from "./Elements/Tabs/Tabs";
import MediaSelect from "./Obavijesti/MediaSelect";

const MediaSelectDialog = ({
  opened,
  onClose,
  value,
  onSelect,
  categoryId,
}) => {
  const { mediaList, setMediaList } = useMedia(categoryId);

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [addMediaLoading, setAddMediaLoading] = useState(false);

  const handleSelectMedia = () => {
    if (selectedTab === 0) {
      if (selectedImage) {
        onSelect(selectedImage);
        setSelectedImage(null);
        onClose();
      }
    } else {
      handleAddMedia();
    }
  };

  const handleAddMedia = async () => {
    setAddMediaLoading(true);
    var reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const createdMedia = await createMedia(
          reader.result,
          selectedFile.type,
          selectedFile.name,
          categoryId
        );

        toast.success("Uspješno prenešena datoteka");
        setMediaList([...mediaList, createdMedia]);
        setSelectedFile(null);
        setSelectedTab(0);
        setSelectedImage(createdMedia);
      } catch (error) {
        toast.error("Greška kod prijenosa datoteke");
      } finally {
        setAddMediaLoading(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  if (!opened) return null;

  return (
    <Dialog
      title="Odaberite sliku"
      handleClose={() => {
        setSelectedFile(null);
        setSelectedTab(0);
        if (!value) setSelectedImage(null);
        else setSelectedImage(value);
        onClose();
      }}
      actions
      actionText={selectedTab === 0 ? "Odaberi" : "Prenesi"}
      handleAction={handleSelectMedia}
      loading={selectedTab === 1 && addMediaLoading}
    >
      <Tabs value={selectedTab} onTabChange={(tabId) => setSelectedTab(tabId)}>
        <Tab>Zbirka medija</Tab>
        <Tab>Prenesi datoteku</Tab>
        <Content>
          <MediaSelect
            mediaList={mediaList}
            value={selectedImage}
            onChange={(val) => setSelectedImage(val)}
            onDoubleClick={handleSelectMedia}
          />
        </Content>
        <Content>
          <MediaFileInput
            value={selectedFile}
            onChange={(val) => setSelectedFile(val)}
          />
        </Content>
      </Tabs>
    </Dialog>
  );
};

export default MediaSelectDialog;

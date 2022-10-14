import Dialog from "../../components/Elements/Dialog";

const MediaDialog = () => {
  return (
    <Dialog
      title="Odaberite sliku"
      handleClose={() => {
        setMediaDialog(null);
        setSelectedFile(null);
        setSelectedTab(0);
        if (!image) setSelectedImage(null);
        else setSelectedImage(image);
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
            onChange={(value) => setSelectedImage(value)}
            onDoubleClick={handleSelectMedia}
          />
        </Content>
        <Content>
          <MediaFileInput
            value={selectedFile}
            onChange={(value) => setSelectedFile(value)}
          />
        </Content>
      </Tabs>
    </Dialog>
  );
};

export default MediaDialog;

import MediaLayout from "../../components/MediaLayout";
import {
  mediaUncategorizedFolderObavijesti,
  obavijestiCategoryId,
} from "../../lib/constants";

const MediaPage = () => {
  return (
    <MediaLayout
      from="obavijesti"
      categoryId={obavijestiCategoryId}
      mediaUncategorizedFolder={mediaUncategorizedFolderObavijesti}
    />
  );
};

export default MediaPage;
